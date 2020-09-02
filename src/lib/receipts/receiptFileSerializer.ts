import * as fs from 'fs'
import * as path from 'path'
import { Guid } from "guid-typescript"
import { HttpClient } from "typed-rest-client/HttpClient"
import { ILogger } from '@lib/core/log'
import { IHeaders } from 'typed-rest-client/Interfaces'

class ReceiptFileSerializer {  
     private readonly client: HttpClient;
    private readonly logger: ILogger;

    constructor(logger: ILogger) {
        this.client = new HttpClient("bfyoc-backend-1");
        this.logger = logger;
    }

    public async serialize(url: string): Promise<string> {
        this.logger.log("Serializing receipt file for url: ", url)

        const fileInfo = this.getFileInfo();
        await this.writeHttpResponseToFile(url, fileInfo);
        let data = await this.getFileDataAsBase64(fileInfo);
        return data;
    }

    private async getFileDataAsBase64(fileInfo: FileInfo): Promise<string> {
        let buffer= Buffer.from(fs.readFileSync(fileInfo.path, 'binary'), 'binary');

        this.logger.log('Buffer length of PDF: ', buffer.length)
        let data = buffer.toString('base64');

        if (data.length == 0) {
            this.logger.log("PDF contents could not be processed. Returning empty string.")
        }

        this.logger.log('deleting file: ', fileInfo.path)
        fs.unlinkSync(fileInfo.path);

        return data;
    }

    private async writeHttpResponseToFile(url: string, fileInfo: FileInfo): Promise<any> {
        let response = await this.client.get(url, <IHeaders>{
            'Content-Type': 'application/pdf'
        });

        const file: NodeJS.WritableStream = fileInfo.stream;
        const filePath: string = fileInfo.path;

        return new Promise((resolve, reject) => {
            file.on("error", (err) => reject(err));
            const stream = response.message.pipe(file);
            stream.on("close", () => {
                try { resolve(filePath); } catch (err) {
                    reject(err);
                }
            });
        });
    }

    private getFileInfo(): FileInfo {
        const filePath: string = path.join(this.getTempFolder(), Guid.create().toString() + ".pdf");

        return <FileInfo>{
            path: filePath,
            stream: <NodeJS.WritableStream>fs.createWriteStream(filePath, { encoding: 'binary', autoClose: true })
        }
    }

    private getTempFolder(): string {
        const folderPath = path.join(process.cwd(), "../tmp");
        
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }

        return folderPath;
    }
}

const receiptFileSerializerFactory = {
    create(logger: ILogger): ReceiptFileSerializer {
        return new ReceiptFileSerializer(logger);
    }
}

interface FileInfo {
    path: string;
    stream: NodeJS.WritableStream
}

export { ReceiptFileSerializer, receiptFileSerializerFactory }