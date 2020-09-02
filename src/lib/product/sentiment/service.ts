import { ISentimentRequest, IDocument } from "./sentimentRequest";
import { HttpClient } from "typed-rest-client/HttpClient";
import { IHeaders, IHttpClientResponse } from "typed-rest-client/Interfaces"
import { SentimentResponse, SentimentDocument } from "./sentimentResponse";
import { Rating } from "../ratings/model";

export class SentimentService {
    private serviceUrl: string = "https://bfyoc-textanalytics-1.cognitiveservices.azure.com/text/analytics/v3.0/sentiment";
    private readonly client: HttpClient;
    private key: string;

    constructor() {
        this.key = process.env.TEXT_ANALYSIS_KEY;
        this.client = new HttpClient("bfyoc-backend-1");
    }

    async get(rating: Rating): Promise<number> {
        const request = <ISentimentRequest>{
            documents: [<IDocument>{
                id: rating.id,
                language: 'en',
                text: rating.userNotes
            }]
        }
        
        const data = JSON.stringify(request);
        let httpResponse: IHttpClientResponse = await this.client.post(this.serviceUrl, data, <IHeaders>{
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': this.key
        });

        let response = await this.getSentimentResponse(httpResponse);
        const score: number = response.documents[0].confidenceScores.positive;
        
        return score;
    }

    async getSentimentResponse(httpResponse: IHttpClientResponse): Promise<SentimentResponse> {
        let body: string = await httpResponse.readBody();
        let response: SentimentResponse = JSON.parse(body);

        return response;
    }

}