import { EntityId } from "durable-functions/lib/src/entities/entityid";

export class SagaData {
    id: EntityId;
    isComplete: boolean;
}