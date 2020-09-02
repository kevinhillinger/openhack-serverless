import 'module-alias/register';
import * as durableFunctions from "durable-functions"
import { DurableOrchestrationClient, IEntityFunctionContext, EntityId } from "durable-functions/lib/src/classes";
import { EventGridEvent } from "@lib/core/eventGridEvent"
import entityIdFactory from "@lib/sales/distributor/entityIdFactory";
import { DistributorOrderMessage, distributorOrderMessageFactory } from "@lib/sales/distributor/distributorOrderMessage";
import { Log, ILogger } from '@lib/core/log';

const  hasStarted = async function (entityId: EntityId, client: DurableOrchestrationClient) {
    let state = await client.readEntityState(entityId);
    return !state.entityExists;
}

const handler = async function (context: IEntityFunctionContext, message: EventGridEvent): Promise<any> {
    Log.logger = <ILogger>context;
    
    const client: DurableOrchestrationClient = durableFunctions.getClient(context);
    const distributorOrderMessage: DistributorOrderMessage = distributorOrderMessageFactory(message);
    const entityId = entityIdFactory(message);

    const hasDistributorOrderSagaBeenStarted = hasStarted(entityId, client);
    const operation = hasDistributorOrderSagaBeenStarted ? 'handle' : 'start';
    context.log(distributorOrderMessage);

    await client.signalEntity(entityId, operation, distributorOrderMessage);

    context.log(`distributorOrderHandlerTrigger with ID = '${entityId.key}'.`);
}

export default handler;