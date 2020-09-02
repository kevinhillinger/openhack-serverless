import 'module-alias/register';
import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { RatingService } from "@lib/product/ratings/service";

const ratingService: RatingService = new RatingService();

const handler: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('Request received to get rating');

    const ratingId: string = context.bindingData.ratingId;
    const rating = await ratingService.get(ratingId);

    if (rating) {
        context.res = {
            body: {
                id: rating.id,
                productId: rating.productId,
                userId: rating.userId,
                timestamp: rating.timestamp,
                locationName: rating.locationName,
                userNotes: rating.userNotes
            }
        };
    }
    else {
        context.res = {
            status: 404,
            body: "rating not found."
        }
    }
};

export default handler;