import { RestClient, IRestResponse, IRequestOptions } from 'typed-rest-client'
import { IRequestQueryParams } from 'typed-rest-client/Interfaces';
import { Cache } from "@lib/core/cache"

export abstract class ServiceBase<T> {
    private readonly client: RestClient;
    protected isCacheFilled: boolean;
    protected cache: Cache<T>;

    constructor(cache: Cache<T>, baseUrl: string) {
        this.cache = cache;
        this.client = new RestClient("bfyoc-backend-", baseUrl);
    }

    public async get(id: string): Promise<T> {
        await this.fillCache();
        return this.cache.get(id);
    }
    
    abstract  async fillCache(): Promise<void>;

    protected async fetch(relativeUrl: string, query: any): Promise<T> {
        let response: IRestResponse<T> = await this.client.get<T>(relativeUrl, <IRequestOptions>{
            queryParameters: <IRequestQueryParams>{
                params: query
            }
        });
        return response.result;
    }

    protected async fetchAll(relativeUrl: string): Promise<T[]> {
        let response: IRestResponse<T[]> = await this.client.get<T[]>(relativeUrl);
        return response.result;
    }
}