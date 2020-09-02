export interface IProductPurchased {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    purchaseTotal: number;
    timestamp: string;
    source: string;
}