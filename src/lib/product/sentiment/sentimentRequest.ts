export interface IDocument {
    language: string;
    id: string;
    text: string;
}

export interface ISentimentRequest {
    documents: IDocument[];
}