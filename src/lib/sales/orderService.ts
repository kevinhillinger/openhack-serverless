import { DataContext } from "@lib/core/dataContext"
import { IOrder } from "./order";

class OrderService  {
    private readonly dataContext: DataContext;

    constructor(dataContext: DataContext) {
        this.dataContext = dataContext;
    }

    public async save(order: IOrder): Promise<void> {
        await this.dataContext.create(order);
    }
}

const orderServiceFactory = {
    create() {
        let dataContext = new DataContext("orders");
        return new OrderService(dataContext);
    }
}

export { OrderService, orderServiceFactory }