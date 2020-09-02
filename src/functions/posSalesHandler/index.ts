import 'module-alias/register';
import { SendableMessageInfo } from '@azure/service-bus'
import { Context } from "@azure/functions/Interfaces";
import { posOrderProcessorFactory, PosOrderProcessor } from "@lib/sales/pointOfSale/processor";
import { ILogger, Log } from "@lib/core/log";
import { IOrder } from '@lib/sales/order';
import { OrderSource } from '@lib/sales/orderSource';
import { busFactory, Bus } from '@lib/core/bus';

const handler = async function (context: Context, messages: IOrder[]): Promise<any> {
    Log.logger = <ILogger>context;
    context.log(`POS Sales received: ${messages.length}`);

    messages.forEach(m => m.source = OrderSource.PointOfSale);

    let processor: PosOrderProcessor = posOrderProcessorFactory.create();
    let receiptsReceived = await processor.process(messages);
    
    let bus: Bus = busFactory.create();
    await bus.publish("receiptReceived", receiptsReceived.map(m => <SendableMessageInfo>{
        body: m,
        userProperties: { totalCost: m.totalCost }
    }));
    context.done();
}

export default handler;
