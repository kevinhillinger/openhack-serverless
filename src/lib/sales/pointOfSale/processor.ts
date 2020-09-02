import { ILogger, Log } from "@lib/core/log";
import { OrderService, orderServiceFactory } from "../orderService";
import { IOrder } from "../order";
import { ReceiptReceived } from "@lib/receipts/receiptReceived";
import { IProductPurchased } from "@lib/product/productPurchased";
import { Guid } from "guid-typescript";
import { Bus, busFactory } from "@lib/core/bus";


class PosOrderProcessor {
    private logger: ILogger;
    private service: OrderService;

    constructor(service: OrderService, logger: ILogger) {
        this.service = service;
        this.logger = logger;
    }

    async process(orders: IOrder[]): Promise<ReceiptReceived[]> {
        let receiptsReceived: Array<ReceiptReceived> = await this.saveOrders(orders);
        await this.publishProductPurchasedEvents(orders);

        return receiptsReceived;
    }

    private async saveOrders(orders: IOrder[]): Promise<ReceiptReceived[]> {
        let receiptsReceived: Array<ReceiptReceived> = [];

        for (let index = 0; index < orders.length; index++) {
            const order = orders[index];

            await this.service.save(order);
            this.logger.log(`Processed order ${order.header.salesNumber}`);

            if (this.hasReceipt(order)) {
                let event = this.mapToReceiptReceived(order);
                receiptsReceived.push(event);
            }
        }
        return receiptsReceived;
    }

    private async publishProductPurchasedEvents(orders: IOrder[]): Promise<void> {
        let events: IProductPurchased[] = [];
        
        for (let index = 0; index < orders.length; index++) {
            const order = orders[index];
            order.details.map(detail => {
                const event: IProductPurchased = <IProductPurchased>{ 
                    id: Guid.create().toString(),
                    timestamp: order.header.dateTime,
                    productId: detail.productId,
                    productName: detail.productName,
                    purchaseTotal: parseFloat(detail.totalCost),
                    quantity: parseFloat(detail.quantity),
                    source: order.source
                };
                return event;
            }).forEach(e => events.push(e));
        }

        let bus: Bus = busFactory.create();
        await bus.sendEvents<IProductPurchased>("productPurchases", events);
    }

    private mapToReceiptReceived(order: IOrder) {
        return <ReceiptReceived>{
            totalItems: order.details.length,
            totalCost: parseFloat(order.header.totalCost),
            salesNumber: order.header.salesNumber,
            salesDate: order.header.dateTime,
            storeLocation: order.header.locationId,
            receiptUrl: order.header.receiptUrl
        };
    }

    private hasReceipt(order: IOrder) {
        return order.header.receiptUrl != undefined || order.header.receiptUrl != null
    }
}

const posOrderProcessorFactory = {
    create() {
        let service = orderServiceFactory.create();
        return new PosOrderProcessor(service, Log.logger);
    }
}

export { PosOrderProcessor, posOrderProcessorFactory }