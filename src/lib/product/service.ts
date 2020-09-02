import { Cache } from "@lib/core/cache"
import { ServiceBase } from "@lib/core/service"

export interface IProduct {
    productId: string,
    productName: string,
    productDescription: string
}

const cache: Cache<IProduct> = new Cache<IProduct>();
const baseUrl: string = "https://serverlessohproduct.trafficmanager.net/";

export class ProductService extends ServiceBase<IProduct> {
    constructor() {
        super(cache, baseUrl);
    }

    async fillCache(): Promise<void> {
        if (this.isCacheFilled) {
            return;
        }
        let products = await this.fetchAll("api/GetProducts");
        products.forEach(p => this.cache.set(p.productId, p));
        this.isCacheFilled = true;
    }
}