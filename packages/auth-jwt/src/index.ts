
import { AuthError, AuthModule, AuthModuleOptions, AuthToken } from '@koa-stack/auth';
import jwt from 'jsonwebtoken';


export interface JwtAuthOptions<PrincipalT> extends AuthModuleOptions<JwtToken<PrincipalT>, PrincipalT> {
    getSecretOrPublicKey: () => Promise<jwt.Secret>;
    // defaults to ['RS256']
    algorithms?: jwt.Algorithm[];
}

export class JwtToken<PrincipalT> extends AuthToken<PrincipalT> {

    header: jwt.JwtHeader;
    signature: string;
    payload: jwt.JwtPayload;

    constructor(module: JwtAuth<PrincipalT>, public token: jwt.Jwt) {
        super(module, (token.payload as jwt.JwtPayload).sub || 'undefined_sub');
        this.payload = token.payload as jwt.JwtPayload;
        this.header = token.header;
        this.signature = token.signature;
    }

}

export class JwtAuth<PrincipalT> extends AuthModule<JwtToken<PrincipalT>, PrincipalT> {

    logError = (err: any) => console.error('Firebase auth failed', err);

    constructor(opts: JwtAuthOptions<PrincipalT>) {
        super('jwt', opts)
    }

    get getSecretOrPublicKey() {
        return (this.opts as JwtAuthOptions<PrincipalT>).getSecretOrPublicKey;
    }

    get algorithms(): jwt.Algorithm[] {
        return (this.opts as JwtAuthOptions<PrincipalT>).algorithms || ['RS256'];
    }

    withErrorLogger(logError: (err: any) => void) {
        this.logError = logError;
        return this;
    }

    async authorize(authScheme: string, authToken: string): Promise<JwtToken<PrincipalT> | undefined> {
        if (authScheme === 'bearer') {
            try {
                const key = await this.getSecretOrPublicKey();
                const decodedToken = jwt.verify(authToken, key, {
                    algorithms: this.algorithms,
                    complete: true
                });
                return new JwtToken(this, decodedToken);
            } catch (err) {
                this.logError(err);
                throw AuthError.notAuthorized();
            }
        }
    }

}
