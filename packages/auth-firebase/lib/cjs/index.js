"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseAuth = exports.FirebaseToken = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const auth_1 = require("@koa-stack/auth");
function verifyIdToken(token, checkRevoked) {
    return firebase_admin_1.default.auth().verifyIdToken(token, checkRevoked);
}
class FirebaseToken extends auth_1.AuthToken {
    constructor(module, token) {
        super(module, token.uid);
        Object.defineProperty(this, "token", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: token
        });
    }
    get email() {
        return this.token.email;
    }
}
exports.FirebaseToken = FirebaseToken;
class FirebaseAuth extends auth_1.AuthModule {
    constructor(opts) {
        super('firebase', opts);
        Object.defineProperty(this, "logError", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (err) => console.error('Firebase auth failed', err)
        });
    }
    withErrorLogger(logError) {
        this.logError = logError;
        return this;
    }
    async authorize(authScheme, authToken) {
        if (authScheme === 'bearer') {
            try {
                const decodedToken = await verifyIdToken(authToken);
                return new FirebaseToken(this, decodedToken);
            }
            catch (err) {
                this.logError(err);
                throw auth_1.AuthError.notAuthorized();
            }
        }
    }
}
exports.FirebaseAuth = FirebaseAuth;
//# sourceMappingURL=index.js.map