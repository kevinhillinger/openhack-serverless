interface Dictionary<T> {
    [key: string]: T;
}

// cache
export class Cache<T> {
    private items: Dictionary<T> = {};

    public get(id: string) {
        return this.items[id];
    }

    public set(key: string, item: T) {
        this.items[key] = item;
    }
}