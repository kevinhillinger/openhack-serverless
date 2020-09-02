import { Cache } from "@lib/core/cache"
import { ServiceBase } from "@lib/core/service"

interface User {
    userId: string,
    userName: string,
    fullName: string
}

const cache: Cache<User> = new Cache<User>();
const baseUrl: string = "https://serverlessohuser.trafficmanager.net/";

export class UserService extends ServiceBase<User> {
    constructor() {
        super(cache, baseUrl);
    }

    public async get(id: string): Promise<User> {
        let user = this.cache.get(id);
        if (!user) {
            user = await this.fetch("api/GetUser", { userId: id });
            this.cache.set(id, user);
        }
        return user;
    }

    fillCache(): Promise<void> {
        this.isCacheFilled = true;
       //do nothing, can't fill cache;
       return;
    }
}