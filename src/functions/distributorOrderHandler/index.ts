import 'module-alias/register';
import { entity } from "durable-functions"
import { IEntityFunctionContext } from "durable-functions/lib/src/classes";
import { DistributorOrderMessage } from "@lib/sales/distributor/distributorOrderMessage";
import { distributorOrderSagaFactory } from "@lib/sales/distributor/saga";
import { DistributorOrderSagaData } from "@lib/sales/distributor/sagaData";
import { Log, ILogger } from '@lib/core/log';

const handler = entity(async function (context: IEntityFunctionContext): Promise<void> {
    context.log("distributorOrderHandler called.")
    Log.logger = <ILogger>context;

    let message = <DistributorOrderMessage>context.df.getInput();
    let operation = context.df.operationName;

    let data = <DistributorOrderSagaData>context.df.getState(() => new DistributorOrderSagaData());
    data.id = context.df.entityId;
    
    let processor = distributorOrderSagaFactory.create(data);
    await processor[operation](message);
    context.log("Saga data", data);

    if (!data.isComplete) {
        context.df.setState(data);
        context.log("state set. saga not complete.");
    } else {
        context.log("Calling destruct on exit.");
        this.context.df.destructOnExit();
    }
});

export default handler;