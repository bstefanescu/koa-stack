import firebase from 'firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';
import { AuthError, AuthModule, AuthModuleOptions, AuthToken } from '@koa-stack/auth';

function verifyIdToken(token: string, checkRevoked?: boolean | undefined) {
    return firebase.auth().verifyIdToken(token, checkRevoked);
}


export class FirebaseToken<PrincipalT> extends AuthToken<PrincipalT> {

    constructor(module: FirebaseAuth<PrincipalT>, public token: DecodedIdToken) {
        super(module, token.uid);
    }

    get email() {
        return this.token.email;
    }

}

export class FirebaseAuth<PrincipalT> extends AuthModule<FirebaseToken<PrincipalT>, PrincipalT> {

    logError = (err: any) => console.error('Firebase auth failed', err);

    constructor(opts: AuthModuleOptions<FirebaseToken<PrincipalT>>) {
        super('firebase', opts)
    }

    withErrorLogger(logError: (err: any) => void) {
        this.logError = logError;
        return this;
    }

    async authorize(authScheme: string, authToken: string): Promise<FirebaseToken<PrincipalT> | undefined> {
        if (authScheme === 'bearer') {
            try {
                const decodedToken = await verifyIdToken(authToken);
                return new FirebaseToken(this, decodedToken);
            } catch (err) {
                this.logError(err);
                throw AuthError.notAuthorized();
            }
        }
    }

}


