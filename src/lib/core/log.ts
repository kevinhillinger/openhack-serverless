
export interface ILogger {
    log: (...args: any[]) => void
}

/**
 * The global logger
 */
export class Log {
    public static logger: ILogger;
    private constructor() {}
}