import { ILogger, Log } from "@lib/core/log";

export class Saga<TData> {
    data: TData;
    logger: ILogger;

    constructor(data: TData, logger: ILogger) {
        this.data = data;
        this.logger = logger;
    }
}
