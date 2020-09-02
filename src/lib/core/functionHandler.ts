
export interface IFunctionHandler {
    handle(): Promise<void>
}

class FunctionHandler implements IFunctionHandler {
    handle(): Promise<void> {
        throw new Error("Method not implemented.");
    }

}