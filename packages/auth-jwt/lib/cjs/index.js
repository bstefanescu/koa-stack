"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuth = exports.JwtToken = void 0;
const auth_1 = require("@koa-stack/auth");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class JwtToken extends auth_1.AuthToken {
    constructor(module, token) {
        super(module, token.payload.sub || 'undefined_sub');
        Object.defineProperty(this, "token", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: token
        });
        Object.defineProperty(this, "header", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "signature", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "payload", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.payload = token.payload;
        this.header = token.header;
        this.signature = token.signature;
    }
}
exports.JwtToken = JwtToken;
class JwtAuth extends auth_1.AuthModule {
    constructor(opts) {
        super('jwt', opts);
        Object.defineProperty(this, "logError", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (err) => console.error('Firebase auth failed', err)
        });
    }
    get getSecretOrPublicKey() {
        return this.opts.getSecretOrPublicKey;
    }
    get algorithms() {
        return this.opts.algorithms || ['RS256'];
    }
    withErrorLogger(logError) {
        this.logError = logError;
        return this;
    }
    async authorize(authScheme, authToken) {
        if (authScheme === 'bearer') {
            try {
                const key = await this.getSecretOrPublicKey();
                const decodedToken = jsonwebtoken_1.default.verify(authToken, key, {
                    algorithms: this.algorithms,
                    complete: true
                });
                return new JwtToken(this, decodedToken);
            }
            catch (err) {
                this.logError(err);
                throw auth_1.AuthError.notAuthorized();
            }
        }
    }
}
exports.JwtAuth = JwtAuth;
//# sourceMappingURL=index.js.map