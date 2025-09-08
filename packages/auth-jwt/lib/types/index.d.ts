import { AuthModule, AuthModuleOptions, AuthToken } from '@koa-stack/auth';
import jwt from 'jsonwebtoken';
export interface JwtAuthOptions<PrincipalT> extends AuthModuleOptions<JwtToken<PrincipalT>, PrincipalT> {
    getSecretOrPublicKey: () => Promise<jwt.Secret>;
    algorithms?: jwt.Algorithm[];
}
export declare class JwtToken<PrincipalT> extends AuthToken<PrincipalT> {
    token: jwt.Jwt;
    header: jwt.JwtHeader;
    signature: string;
    payload: jwt.JwtPayload;
    constructor(module: JwtAuth<PrincipalT>, token: jwt.Jwt);
}
export declare class JwtAuth<PrincipalT> extends AuthModule<JwtToken<PrincipalT>, PrincipalT> {
    logError: (err: any) => void;
    constructor(opts: JwtAuthOptions<PrincipalT>);
    get getSecretOrPublicKey(): () => Promise<jwt.Secret>;
    get algorithms(): jwt.Algorithm[];
    withErrorLogger(logError: (err: any) => void): this;
    authorize(authScheme: string, authToken: string): Promise<JwtToken<PrincipalT> | undefined>;
}
//# sourceMappingURL=index.d.ts.map