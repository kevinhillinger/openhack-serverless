#!/bin/bash

echo "Deploying Resource Groups."
az deployment sub create --name "oh-deployment-1" --location "eastus2" \
    --template-file ./azure/templates/resourcegroups.json \
    --parameters ./azure/templates/resourcegroups.parameters.json \
    --output none
echo "Done."

resource_groups=$(cat ./azure/templates/resourcegroups.parameters.json | jq '.parameters.resourceGroups.value')

for rg in $(echo $resource_groups | jq -c -r '.[]'); do
    suffix=$(echo $rg | jq '.suffix' -r)
    resource_group=$(echo $rg | jq '.name' -r)-$suffix
    location=$(echo $rg | jq '.location' -r)
    
    echo "Deploying resources to:"
    echo "  Resource Group: $resource_group"
    echo "  Location: $location"

    # function app
    func_storage_name="bfyocfunc24store$suffix"
    func_app=bfyoc-functionapp-$suffix

    az storage account create \
        --name $func_storage_name \
        --location $location \
        -g $resource_group \
        --sku Standard_LRS \
        --kind StorageV2

    az functionapp create -g $resource_group  \
        --consumption-plan-location $location \
        -n $func_app \
        -s $func_storage_name \
        --runtime node \
        --functions-version 3 \
        --runtime-version 12 \
        --os-type Linux

    az functionapp cors add -g $resource_group -n $func_app \
        --allowed-origins *

    # todo: get function path for getProducts and the function code, update logicapp.definition

    # logic app
    echo "Creating logic app"
    logic_app=bfyoc-logicapp-$suffix

    az logic workflow create \
        --definition ./azure/logicapp.definition.json \
        --location $location \
        --name $logic_app \
        --resource-group $resource_group

    # cosmos
    echo "Creating cosmos db."
    cosmos_account=bfyoc-cosmos-$suffix
    cosmos_database=default

    az cosmosdb create \
        --resource-group $resource_group \
        --name $cosmos_account
        --default-consistency-level Session

    az cosmosdb sql database create \
        -a $cosmos_account \
        -g $resource_group \
        -n $cosmos_database \
        --max-throughput $max_throughput

    # ratings container
    partition_key='/productId'
    max_throughput=4000
    container_name=ratings

    az cosmosdb sql container create \
        -a $cosmos_account \
        -g $resource_group \
        -d $cosmos_database \
        -n $container_name \
        -p $partition_key 

    # set configuration connection string for function app
    functionapp_cosmosdb_connection_setting_name=COSMOS_CONNECTION_STRING
    cosmos_connection_string=$(az cosmosdb list-connection-strings --name $cosmos_account --resource-group $resource_group -o tsv --query 'connectionStrings[0].connectionString')
    
    az functionapp config appsettings set \
        --name $func_app \
        --resource-group $resource_group \
        --settings "$functionapp_cosmosdb_connection_setting_name=$cosmos_connection_string"

    # api management
    apim_name=bfyoc-apim-$suffix

    az apim create --name $apim_name -g $resource_group \
        --location $location \
        --sku-name Consumption \
        --publisher-email bfyoc@nowhere.com \
        --publisher-name bfyoc

    # logic apps distributor notification
    echo "Creating logic app"
    logic_app_notify=bfyoc-logicapp-notify-$suffix

    az logic workflow create \
        --definition ./azure/logicapp.notify.definition.json \
        --location $location \
        --name $logic_app_notify \
        --resource-group $resource_group

    # batch processing - challenge 6

    # storage 
    batch_storage_name=bfyocbatchstore$suffix

    az storage account create \
        --name $batch_storage_name \
        --location $location \
        -g $resource_group \
        --sku Standard_LRS \
        --kind StorageV2

    # event grid

    # post to challenge endpoint to register
    conn=$(az storage account show-connection-string --name $batch_storage_name --query connectionString -o tsv)
    num=challenger-table-24

    storage_registration_json=$( jq -n \
                 --arg conn "$conn" \
                  --arg num "$num" \
                  '{storageAccountConnectionString: $conn, teamTableNumber: $num, blobContainerName: "orders"}' )

    curl --header "Content-Type: application/json" \
        --request POST \
        --data $storage_registration_json \
         https://serverlessohmanagementapi.trafficmanager.net/api/team/registerStorageAccount

    # TODO: create an event hub namespace and a hub of 32 partitions, create a Send key, fetch the connection string then post it to the challenge endpoint
    # TODO: register app setting with the function app

    # TODO: create azure service bus namespace and topic
    # Add SB_CONNECTION_STRING to function app

    # TODO: create bfyoc-textanalytics-1 text analysis service instance, get key

    # challenge 10
    # create stream analaytics instance, bfyoc-streamanalytics-1
    
    # create container in cosmos: productanalysis
    
    # TODO: script out all the configuration values needed to run the functionapp
    #   - use CLI to fetch values
    #   - keys are known from a config file
    #   - set then in Azure App Configuration
    #   - update to use Azure App Configuration client (@azure/app-configuration)
    #   - write a wrapper FunctionHandler that does this and sets process.env values based on this
    #   - update build script so that local debug environment fetches the values from azure app config, sets local.appsettings.json
done