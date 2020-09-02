import { EventGridEvent } from "@lib/core/eventGridEvent";
import { BatchFileTypeParser } from "./parsers/batchFileTypeParser";
import { BatchFileIdParser } from "./parsers/batchFileIdParser";

export class BatchFile {
    id: string;
    fileType: string;
    url: string;

    constructor(id: string, fileType: string, url: string) {
        this.id = id;
        this.fileType = fileType;
        this.url = url;
    }

    /**
     * Factory function for creating a batch file
     * @param message 
     */
    static create(message: EventGridEvent): BatchFile {
        let blobPath = message.subject;
        let batchId: string = BatchFileIdParser.parse(blobPath);
        let batchType = BatchFileTypeParser.parse(blobPath);
        let url: string = <string>message.data.url;

        return new BatchFile(batchId, batchType, url)
    }
}