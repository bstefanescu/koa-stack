import { DecodedIdToken } from 'firebase-admin/auth';
import { AuthModule, AuthModuleOptions, AuthToken } from '@koa-stack/auth';
export declare class FirebaseToken<PrincipalT> extends AuthToken<PrincipalT> {
    token: DecodedIdToken;
    constructor(module: FirebaseAuth<PrincipalT>, token: DecodedIdToken);
    get email(): string | undefined;
}
export declare class FirebaseAuth<PrincipalT> extends AuthModule<FirebaseToken<PrincipalT>, PrincipalT> {
    logError: (err: any) => void;
    constructor(opts: AuthModuleOptions<FirebaseToken<PrincipalT>>);
    withErrorLogger(logError: (err: any) => void): this;
    authorize(authScheme: string, authToken: string): Promise<FirebaseToken<PrincipalT> | undefined>;
}
//# sourceMappingURL=index.d.ts.map