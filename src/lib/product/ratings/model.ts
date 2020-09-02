
export interface Rating {
    id: string;
    userId: string;
    productId: string;
    timestamp: string;
    locationName: string;
    rating: number;
    userNotes: string;
    sentimentScore: number
}