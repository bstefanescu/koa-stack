import { AuthError } from "./error.js";
import { AuthModule, AuthToken } from "./module.js";
export class ApiKeyToken extends AuthToken {
    constructor(module, apiKey) {
        super(module, apiKey);
    }
}
export class ApiKeyAuth extends AuthModule {
    constructor(opts) {
        super('apikey', opts);
        Object.defineProperty(this, "prefixes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "scheme", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.scheme = opts.scheme || 'bearer';
        this.prefixes = opts.prefixes;
        if (!this.prefixes || !this.prefixes.length) {
            throw new AuthError("ApiKey auth options must include a prefixes array", 500);
        }
    }
    authorize(authScheme, authToken) {
        if (authScheme === this.scheme) {
            for (const prefix of this.prefixes) {
                if (authToken.startsWith(prefix)) {
                    return Promise.resolve(new ApiKeyToken(this, authToken));
                }
            }
        }
        return Promise.resolve(undefined);
    }
}
//# sourceMappingURL=apikey.js.map