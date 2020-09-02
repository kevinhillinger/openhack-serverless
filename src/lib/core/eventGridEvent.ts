/**
 * Properties of an event published to an Event Grid topic.
 */
export interface EventGridEvent {
    /**
     * An unique identifier for the event.
     */
    id: string;
    /**
     * The resource path of the event source.
     */
    topic?: string;
    /**
     * A resource path relative to the topic path.
     */
    subject: string;
    /**
     * Event data specific to the event type.
     */
    data: {
        [k: string]: unknown;
    };
    /**
     * The type of the event that occurred.
     */
    eventType: string;
    /**
     * The time (in UTC) the event was generated.
     */
    eventTime: string;
    /**
     * The schema version of the event metadata.
     */
    metadataVersion?: string;
    /**
     * The schema version of the data object.
     */
    dataVersion: string;
    [k: string]: unknown;
}
