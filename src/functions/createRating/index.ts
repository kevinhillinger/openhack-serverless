import 'module-alias/register';
import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { UserValidator } from '@lib/user/validator';
import { ProductValidator } from '@lib/product/validator';
import { Rating } from '@lib/product/ratings/model';
import { Guid } from 'guid-typescript';
import { RatingService } from '@lib/product/ratings/service';
import { RatingValidator } from '@lib/product/ratings/validator';
import { SentimentService } from '@lib/product/sentiment/service';
import { Bus, busFactory } from '@lib/core/bus';
import { IProductSentimentReceived } from '@lib/product/sentiment/sentimentReceived';
import { ProductService, IProduct } from '@lib/product/service';
import { Log, ILogger } from '@lib/core/log';

const handler: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('Create Rating called.');
    Log.logger = <ILogger>context;
    
    let command: CreateRatingRequest = req.body as CreateRatingRequest;
    let response: HttpResponse = <HttpResponse>{};

    let isValidRequest = await validateRequest(command.userId, command.productId, command.rating);
    response.status = !isValidRequest ? 404 : 200;

    if (isValidRequest) {
        let rating: Rating = map(command);

        rating.sentimentScore = await sentimentService.get(rating);
        context.log("rating score|", JSON.stringify({ ratingId: rating.id, score: rating.sentimentScore }));
        context.log('Request is valid. Inserting the rating');
        context.log(rating);
        
        await service.create(rating);

        // publish event that a product sentiment was received
        let bus: Bus = busFactory.create();     
        let event: IProductSentimentReceived = await mapFrom(rating);
        await bus.sendEvents("productsentiment", [event]);

        response.body = rating;
    }

    context.res = response;
};

interface CreateRatingRequest {
    userId: string,
    productId: string,
    locationName: string,
    rating: number,
    userNotes: string
}

interface HttpResponse {
    [key: string]: any
}

function map(command: CreateRatingRequest): Rating {
    return <Rating>{
        id: Guid.create().toString(),
        productId: command.productId,
        userId: command.userId,
        timestamp: new Date().toISOString(),
        rating: command.rating,
        locationName: command.locationName,
        userNotes: command.userNotes
    };
}

const service = new RatingService();
const sentimentService = new SentimentService();

async function validateRequest(userId: string, productId: string, ratingValue: number): Promise<boolean> {
    const userValidator = new UserValidator();
    const productValidator = new ProductValidator();
    const ratingValidator = new RatingValidator();

    let userResults = await userValidator.validate(userId);
    let productResults = await productValidator.validate(productId);
    let ratingResults = ratingValidator.validate(ratingValue);

    return userResults.isValid && productResults.isValid && ratingResults.isValid;
}

async function mapFrom(rating: Rating): Promise<IProductSentimentReceived> {
    let productService = new ProductService();
    let product: IProduct = await productService.get(rating.productId);

    let bus: Bus = busFactory.create();
    
    let event = <IProductSentimentReceived>{
        id: Guid.create().toString(),
        productId: product.productId,
        productName: product.productName,
        sentimentScore: rating.sentimentScore,
        timestamp: rating.timestamp,
    };

    return event;
}

export default handler;