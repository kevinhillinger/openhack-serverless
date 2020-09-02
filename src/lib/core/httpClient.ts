import { HttpClient } from "typed-rest-client/HttpClient";
import { ILogger, Log } from "./log";
import { IHttpClientResponse, IRequestOptions } from "typed-rest-client/Interfaces";

interface IHttpClient {
    post<TRequest, TResponse>(url: string, request: TRequest): Promise<TResponse>;
}

class DefaultHttpClient implements IHttpClient {
    private readonly baseUrl: string;
    private readonly client: HttpClient;
    private readonly logger: ILogger;
    
    constructor(baseUrl: string = null, client: HttpClient, logger: ILogger) {
        this.baseUrl = baseUrl;
        this.client = client
        this.logger = logger;
    }
    
    async post<TRequest, TResponse>(url: string, request: TRequest): Promise<TResponse> {
        const requestUrl = this.resolveUrl(url);
        const data = JSON.stringify(request, null, 2);

        let httpResponse: IHttpClientResponse = await this.client.post(requestUrl, data);
        let body: string = await httpResponse.readBody();
        let response: TResponse = JSON.parse(body);
    
        return response;
    }

    private resolveUrl(url: string): string {
        return this.baseUrl ? this.baseUrl.concat(url) : url;
    }
}

const httpClientFactory = {
    create(baseUrl: string = null): IHttpClient {
        let client = new HttpClient("bfyoc-backend-1", null, <IRequestOptions>{
            ignoreSslError: true
        });
        let logger = Log.logger;
        return new DefaultHttpClient(baseUrl, client, logger);
    }
}

export { IHttpClient, httpClientFactory }