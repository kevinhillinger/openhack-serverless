import { ReceiptFileSerializer } from "./receiptFileSerializer";
import { ILargeArchiveReceipt, IArchiveReceipt } from "./archiveReceipt";
import { ReceiptReceived } from "./receiptReceived";
import * as Url from 'url'
import { ILogger, Log } from "@lib/core/log";

class ReceiptReceivedHandler {
    private serializer: ReceiptFileSerializer;
    private logger: ILogger;

    constructor(serializer: ReceiptFileSerializer, logger: ILogger) {
        this.serializer = serializer;
        this.logger = logger;
    }

    async handle(message: ReceiptReceived, includeReceiptFile: boolean): Promise<string> {
        let archive: any = <IArchiveReceipt>{
            Store: message.storeLocation,
            SalesNumber: message.salesNumber,
            SalesDate: message.salesDate,
            TotalCost: message.totalCost,
            Items: message.totalItems
        };

        if (includeReceiptFile && this.isReceiptUrlValid(message.receiptUrl)) {
            this.logger.log("Receipt Url is valid: ", message.receiptUrl)
            
            const receiptImage = await this.serializer.serialize(message.receiptUrl);
            (<ILargeArchiveReceipt>archive).ReceiptImage = receiptImage;
        }
        return JSON.stringify(archive);
    }

    isReceiptUrlValid(url: string): boolean {
        return url && Url.parse(url) != null;
    }
}

const receiptReceivedHandlerFactory = {
    create(): ReceiptReceivedHandler {
        let logger: ILogger= Log.logger;
        let serializer = new ReceiptFileSerializer(logger);
        return new ReceiptReceivedHandler(serializer, logger);
    }
}

export { ReceiptReceivedHandler, receiptReceivedHandlerFactory }