import { BatchFile } from "./batchFile";
import { IMessage } from "@lib/core/message"
import { EventGridEvent } from "@lib/core/eventGridEvent";

/**
 * Distributor Order Message
 */
class DistributorOrderMessage implements IMessage {
    id: string; // the event grid message id
    batchFile: BatchFile;
}

const distributorOrderMessageFactory = function(eventGridEvent: EventGridEvent): DistributorOrderMessage {
    let message = new DistributorOrderMessage();
    message.id = eventGridEvent.id;
    message.batchFile = BatchFile.create(eventGridEvent);

    return message;
}

export { DistributorOrderMessage, distributorOrderMessageFactory }