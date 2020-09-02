
export interface ConfidenceScores {
    positive: number;
    neutral: number;
    negative: number;
}

export interface Sentence {
    sentiment: string;
    confidenceScores: ConfidenceScores;
    offset: number;
    length: number;
    text: string;
}

export interface SentimentDocument {
    id: string;
    sentiment: string;
    confidenceScores: ConfidenceScores;
    sentences: Sentence[];
    warnings: any[];
}

export interface SentimentResponse {
    documents: SentimentDocument[];
    errors: any[];
    modelVersion: string;
}
