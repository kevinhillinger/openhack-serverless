
export interface IOrderHeader {
    salesNumber: string;
    dateTime: string;
    locationId: string;
    locationName: string;
    locationAddress: string;
    locationPostcode: string;
    totalCost: string;
    totalTax: string;
    receiptUrl: string;
}

export interface IOrderDetail {
    productId: string;
    quantity: string;
    unitCost: string;
    totalCost: string;
    totalTax: string;
    productName: string;
    productDescription: string;
}

export interface IOrder {
    header: IOrderHeader;
    details: IOrderDetail[];
    source: string;
}