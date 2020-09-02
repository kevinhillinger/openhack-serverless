import { EventHubProducerClient, EventDataBatch } from "@azure/event-hubs";
import { ServiceBusClient, SendableMessageInfo, Sender } from '@azure/service-bus'
import { ILogger, Log } from "./log";

class Bus {
    serviceBus : ServiceBusClient;
    logger: ILogger;

    constructor(serviceBus : ServiceBusClient, logger: ILogger) {
        this.serviceBus = serviceBus;
        this.logger = logger;
    }

    async sendEvents<T>(hubName: string, messages: T[]): Promise<void> {
        const client = new EventHubProducerClient(process.env.EVENTHUB_CONNECTION_STRING, hubName);
        const batchOptions = {};
        let batch = await client.createBatch(batchOptions);

          for (let index = 0; index < messages.length; index++) {
              const message = { body: messages[index] }
              batch.tryAdd(message);

             // this.logger.log(`Message added to batch:`, message);
          }
          await client.sendBatch(batch);
          this.logger.log(`Messages sent to hub ${hubName}:`, batch.count)
    }

    async publish<T extends SendableMessageInfo>(topic: string, messages: T[]): Promise<void> {
        const sender = this.getSender(topic);

        for (let index = 0; index < messages.length; index++) {
            const msg = messages[index];
            await sender.send(msg);
        }
        await sender.close();
    }

    private getSender(topic: string): Sender {
        return this.serviceBus.createTopicClient(topic).createSender();
    }
}

const busFactory = {
    create() {
        const serviceBus = ServiceBusClient.createFromConnectionString(process.env.SB_CONNECTION_STRING);
        return new Bus(serviceBus, Log.logger);
    }
}

export { Bus, busFactory }