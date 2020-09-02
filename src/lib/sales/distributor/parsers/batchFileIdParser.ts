

export class BatchFileIdParser {
    static parse(input: string): string {
        const regex = /(?!\/)([0-9])\w+/;
        let result = regex.exec(input);
        return result[0];
    }
}
