import { DataContext } from "@lib/core/dataContext"
import { Rating } from "./model"
import { ServiceBase } from "@lib/core/service"
import { Cache } from "@lib/core/cache"

const cache: Cache<Rating> = new Cache<Rating>();

export class RatingService extends ServiceBase<Rating> {
    private readonly name: string = "rating service";
    private readonly dataContext = new DataContext("ratings");

    constructor() {
        super(cache, null);
    }

    public async create(rating: Rating): Promise<void> {
        await this.dataContext.create(rating);
    }

    public async get(id: string): Promise<Rating> {
        return await this.dataContext.find(id);
    }

    fillCache(): Promise<void> {
       // do nothing right now;
       return;
    }
    
    public async findAll(userId: string): Promise<Rating[]> {
        const query = `SELECT * FROM c WHERE c.userId = '${userId}'`;
        const items = await this.dataContext.findAll(query);

        let ratings = items.map(item => {
            return <Rating>{
                id: item.id,
                userId: item.userId,
                timestamp: item.timestamp,
                rating: item.rating,
                locationName: item.locationName,
                productId: item.productId,
                userNotes: item.userNotes
            };
        });
        return ratings;
    }
}