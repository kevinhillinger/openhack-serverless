import 'module-alias/register';
import { ReceiptReceived } from "@lib/receipts/receiptReceived";
import { Context } from "@azure/functions/Interfaces";
import { receiptReceivedHandlerFactory, ReceiptReceivedHandler } from '@lib/receipts/receiptReceivedHandler';
import { ILogger, Log } from '@lib/core/log';

const handler = async function (context: Context, message: ReceiptReceived): Promise<any> {
    Log.logger = <ILogger>context;

    context.log('Small ReceiptReceived subscriber triggered: ', message);
    const handler: ReceiptReceivedHandler = receiptReceivedHandlerFactory.create();
    const archiveData = await handler.handle(message, false);
    
    context.bindings.outputBlob = archiveData;
    context.done();
}

export default handler;