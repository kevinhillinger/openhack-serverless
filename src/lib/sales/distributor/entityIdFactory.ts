import { EventGridEvent } from "@lib/core/eventGridEvent";
import { EntityId } from "durable-functions";
import { DistributorOrderSagaData } from "./sagaData";

/**
 * Creates an entity id for the saga (e.g. the "durable entity function") to get|set it's state data
 * @param message The event grid message that is received when a batch file is received from a distributor
 */
const entityIdFactory = function(message: EventGridEvent): EntityId {
    let getBatchId = function() {
        const regex = /(?!\/)([0-9])\w+/;
        let result = regex.exec(message.subject);
        return result[0];
    }

    let batchId = getBatchId();
    return new EntityId(DistributorOrderSagaData.typeName, batchId);
}

export default entityIdFactory;