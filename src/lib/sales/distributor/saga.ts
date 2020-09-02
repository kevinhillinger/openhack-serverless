import { DistributorOrderSagaData } from "./sagaData";
import { DistributorOrderMessage } from "./distributorOrderMessage";
import { EntityId } from "durable-functions/lib/src/classes";
import { IOrder } from "../order";
import { CombineOrderService, combineOrderServiceFactory } from "./combineOrder/service";
import { ICombineOrderRequest } from "./combineOrder/request";
import { BatchFileType } from "./batchFileType";
import { OrderService, orderServiceFactory } from "../orderService";
import { ILogger, Log } from "@lib/core/log";
import { Saga } from "@lib/core/saga";
import { IProductPurchased } from "@lib/product/productPurchased";
import { Guid } from "guid-typescript";
import { busFactory, Bus } from "@lib/core/bus";

class DistributorOrderSaga extends Saga<DistributorOrderSagaData> {
    combineOrderService: CombineOrderService;
    orderService: OrderService;

    constructor(data: DistributorOrderSagaData, combineOrderService: CombineOrderService, 
                            orderService: OrderService, logger: ILogger) {
        super(data, logger);
        this.combineOrderService = combineOrderService;
        this.orderService = orderService;
    }

    async start(message: DistributorOrderMessage): Promise<void>  {
        this.logger.log("DistributorOrderProcessor started for batch " + message.batchFile.id);
        this.data.id = new EntityId(DistributorOrderSagaData.typeName, message.batchFile.id.toString());
        await this.handle(message);
    }

    async handle(message: DistributorOrderMessage): Promise<void> {
        this.logger.log('Executing handle for batch:', message);

        this.updateData(message);

        if (this.isBatchOrderReadyToBeCombined()) {
            this.logger.log("All files received for batch " + this.data.id.key);
           
            let orders = await this.combineBatchOrder();
            this.logger.log("Combined orders");
            this.data.isComplete = true;

            await this.saveOrders(orders);
            await this.publishProductPurchasedEvents(orders);
            
            this.logger.log('Distributor order processing complete.')
        }
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
        await bus.sendEvents<IProductPurchased>("productpurchases", events);
    }

    private updateData(message: DistributorOrderMessage) {
        const url = message.batchFile.url;
        switch (message.batchFile.fileType) {
            case BatchFileType.Header:
                this.data.orderHeaderDetailsReceived = true;
                this.data.orderHeaderDetailsCSVUrl = url;
                break;
            case BatchFileType.LineItems:
                this.data.orderLIneItemsReceived = true;
                this.data.orderLineItemsCSVUrl = url;
                break;
            case BatchFileType.ProductInformation:
                    this.data.productInformationReceived = true;
                    this.data.productInformationCSVUrl = url;
            default:
                break;
        }
    }

    private async saveOrders(orders: IOrder[]): Promise<void> {
        this.logger.log("Saving orders to the database.");

        for (let index = 0; index < orders.length; index++) {
            const order = orders[index];
            await this.orderService.save(order);
        }
    }

    private async combineBatchOrder(): Promise<IOrder[]> {
        let request = <ICombineOrderRequest>{
            orderHeaderDetailsCSVUrl: this.data.orderHeaderDetailsCSVUrl,
            orderLineItemsCSVUrl: this.data.orderLineItemsCSVUrl,
            productInformationCSVUrl: this.data.productInformationCSVUrl
        };
        
        this.logger.log("Combine Batch Order: ", request);
        let orders =  await this.combineOrderService.combine(request);

        return orders;
    }

    private isBatchOrderReadyToBeCombined() {
        return  this.data.orderHeaderDetailsReceived && this.data.orderLIneItemsReceived && this.data.productInformationReceived;
    }
}

const distributorOrderSagaFactory = {
    create(data: DistributorOrderSagaData) {
        let combineOrderService = combineOrderServiceFactory.create();
        let orderService = orderServiceFactory.create();
        let logger = Log.logger;
        
        return new DistributorOrderSaga(data, combineOrderService, orderService, logger);
    }
}

export { DistributorOrderSaga, distributorOrderSagaFactory }
