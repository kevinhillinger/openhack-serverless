import { SagaData } from "@lib/core/sagaData";

export class DistributorOrderSagaData extends SagaData {
    public static typeName: string = "distributorOrderHandler";

    orderHeaderDetailsReceived: boolean;
    orderLIneItemsReceived: boolean;
    productInformationReceived: boolean;

    orderHeaderDetailsCSVUrl: string;
    orderLineItemsCSVUrl: string;
    productInformationCSVUrl: string;
}