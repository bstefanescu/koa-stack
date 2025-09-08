import { AuthError, AuthModule, AuthToken } from '@koa-stack/auth';
import jwt from 'jsonwebtoken';
export class JwtToken extends AuthToken {
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
export class JwtAuth extends AuthModule {
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
                const decodedToken = jwt.verify(authToken, key, {
                    algorithms: this.algorithms,
                    complete: true
                });
                return new JwtToken(this, decodedToken);
            }
            catch (err) {
                this.logError(err);
                throw AuthError.notAuthorized();
            }
        }
    }
}
//# sourceMappingURL=index.js.map