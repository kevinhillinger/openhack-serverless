import { EntityId } from "durable-functions/lib/src/entities/entityid";

export interface ISagaContext {
    getState(initializer?: () => unknown): unknown | undefined;
    setState(state: unknown): void;
    getInput(): unknown | undefined;
    destructOnExit(): void;

    readonly entityId: EntityId;
}