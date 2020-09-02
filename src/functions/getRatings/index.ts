import 'module-alias/register';
import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { RatingService } from "@lib/product/ratings/service"

const ratingService = new RatingService();

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const userId = req.query.userId;
    context.log(`Request received for userId '${userId}'`);

    let ratings = await ratingService.findAll(userId);
    context.res = { body: ratings };
};

export default httpTrigger;