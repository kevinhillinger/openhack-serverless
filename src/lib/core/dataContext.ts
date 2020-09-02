import { CosmosClient, CosmosClientOptions, Container, SqlQuerySpec } from "@azure/cosmos"
import { RequestOptions } from "https";

const options: CosmosClientOptions =  {
    endpoint: "https://bfyoc-cosmos-1.documents.azure.com:443/",
    key: "EcrwEJp4U5J4OauX7A2Gu5LEomwtwoL17uFutv8GmX9tKC4FEc7cxVsTIE9QIpa41DOxaqBFQDVtYsY2uBYeXg=="
}

export class DataContext {
    private readonly client: CosmosClient = new CosmosClient(options);
    private readonly databaseId: string = "default";
    private containerId: string;

    constructor(containerId: string) {
        this.containerId = containerId;
    }

    public async create(document: any): Promise<void> {
        let container = this.getContainer();
        await container.items.create(document);
    }
    
    public async findAll(query: string): Promise<any[]> {
        const statement = <SqlQuerySpec>{
            query: query
        };
        let container = this.getContainer();
        const response = await container.items.query(statement).fetchAll();
        return response.resources;
    }

    public async find(id: string): Promise<any> {
        let container = this.getContainer();
        let response = await this.findAll(`SELECT * FROM c WHERE c.id = '${id}'`);
        return response[0];
    }

    private getContainer(): Container {
        return this.client.database(this.databaseId).container(this.containerId);
    }
}

export default DataContext;