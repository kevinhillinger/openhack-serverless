import { ICombineOrderRequest } from "./request";
import { IHttpClient, httpClientFactory } from "@lib/core/httpClient";
import { IResponseItem } from "./response";
import { OrderSource } from "@lib/sales/orderSource";
import { IOrder } from "@lib/sales/order";

class CombineOrderService {
    private readonly client: IHttpClient;
    
    constructor(client: IHttpClient) {
        this.client = client;
    }
    
    async combine(request: ICombineOrderRequest): Promise<IOrder[]> {
        let response = await this.client.post<ICombineOrderRequest, IResponseItem[]>("api/order/combineOrderContent", request);
        let orders = response.map(item => <IOrder>{ 
            header: item.headers, 
            details: item.details, 
            source: OrderSource.Distributor 
        });

        return orders;
    }
}

class CombineOrderServiceFactory {
    private static baseUrl: string = "https://serverlessohmanagementapi.trafficmanager.net/";

    create(): CombineOrderService {
        let client = httpClientFactory.create(CombineOrderServiceFactory.baseUrl);
        return new CombineOrderService(client);
    }
}
const combineOrderServiceFactory = new CombineOrderServiceFactory();

export { CombineOrderService, combineOrderServiceFactory }