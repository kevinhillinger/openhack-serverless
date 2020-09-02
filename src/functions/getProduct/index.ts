import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { Guid } from "guid-typescript"

const handler: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const productId = Guid.parse(req.query.productId || context.bindingData.id);
    let isProductIdValid = productId.toString() != Guid.EMPTY;
    let response: HttpResponse = {};

    if (isProductIdValid) {
        response.body = createResponse(productId);
    }
    else {
        response.status = 406;
        response.body = `Invalid Product ID of ${context.bindingData.id}.`;
    }

    context.res = response;
};

interface HttpResponse {
    [key: string]: any
}

function createResponse(productId: Guid): string {
    let message = `The product name for your product id ${productId} is Starfruit Explosion`;
    return message;
}

export default handler;