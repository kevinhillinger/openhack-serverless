
export class BatchFileTypeParser {
    static parse(input: string): string {
        const regex = /([aA-zZ]\w+)(?=\.csv)/;
        let result = regex.exec(input);
        return result[0];
    }
}