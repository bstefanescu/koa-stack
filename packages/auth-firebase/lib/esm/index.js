import firebase from 'firebase-admin';
import { AuthError, AuthModule, AuthToken } from '@koa-stack/auth';
function verifyIdToken(token, checkRevoked) {
    return firebase.auth().verifyIdToken(token, checkRevoked);
}
export class FirebaseToken extends AuthToken {
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
export class FirebaseAuth extends AuthModule {
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
                throw AuthError.notAuthorized();
            }
        }
    }
}
//# sourceMappingURL=index.js.map