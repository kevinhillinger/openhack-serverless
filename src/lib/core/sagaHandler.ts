import { SagaData } from "./sagaData";
import { ISagaContext } from "./sagaContext";
import { ILogger, Log } from "./log";


class SagaHandler<TData extends SagaData> {
    private readonly context: ISagaContext;
    private readonly stateInitializer: new () => TData;
    data: TData;
    logger: ILogger;
    defaultData: TData;
    
    constructor(context: ISagaContext, logger: ILogger, defaultData: TData) {
        this.context = context;
        this.logger = logger;
        this.defaultData = defaultData;
    }

    public handle(func: (data: TData) => void) {
        this.logger.log("sagaHandler.handle executed");

        this.getState();
        func(this.data);
        this.setState();
    }

    private setState() {
        this.logger.log("sagaHandler setting state:", this.data);

        if (!this.data.isComplete) {
            this.context.setState(this.data);
            this.logger.log("sagaHandler state set");
        } else {
            this.context.destructOnExit();
        }
    }

    private getState() {
        this.data = <TData>this.context.getState(() => this.defaultData);

        this.data.id = this.context.entityId;

        this.logger.log("sagaHandler data:", this.data);
    }
}

const sagaHandlerFactory = {
    create<TData extends SagaData>(context: ISagaContext, defaultData: TData): SagaHandler<TData> {
        let handler = new SagaHandler<TData>(context, Log.logger, defaultData);
        return handler;
    }
}

export { SagaHandler, sagaHandlerFactory }