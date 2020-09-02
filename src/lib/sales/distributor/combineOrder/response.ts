
export interface IHeaders {
    salesNumber: string;
    dateTime: string;
    locationId: string;
    locationName: string;
    locationAddress: string;
    locationPostcode: string;
    totalCost: string;
    totalTax: string;
}

export interface IDetail {
    productId: string;
    quantity: string;
    unitCost: string;
    totalCost: string;
    totalTax: string;
    productName: string;
    productDescription: string;
}

/**
 * The response item from the combine order API
 */
export interface IResponseItem {
    headers: IHeaders;
    details: IDetail[];
}