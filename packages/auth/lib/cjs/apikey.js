"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyAuth = exports.ApiKeyToken = void 0;
const error_js_1 = require("./error.js");
const module_js_1 = require("./module.js");
class ApiKeyToken extends module_js_1.AuthToken {
    constructor(module, apiKey) {
        super(module, apiKey);
    }
}
exports.ApiKeyToken = ApiKeyToken;
class ApiKeyAuth extends module_js_1.AuthModule {
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
            throw new error_js_1.AuthError("ApiKey auth options must include a prefixes array", 500);
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
exports.ApiKeyAuth = ApiKeyAuth;
//# sourceMappingURL=apikey.js.map