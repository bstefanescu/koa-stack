import { IncomingMessage } from 'http';
import { Context, Next } from 'koa';
export declare abstract class AuthToken<PrincipalT = any> {
    module: AuthModule<any, PrincipalT>;
    id: string;
    _principal: Promise<any> | undefined;
    constructor(module: AuthModule<any, PrincipalT>, id: string);
    get type(): string;
    get isAnonymous(): boolean;
    get email(): string | undefined;
    getPrincipal(): Promise<PrincipalT | null>;
}
export declare function registerAuthModule(module: AuthModule<any>): void;
export interface AuthModuleOptions<TokenT extends AuthToken, PrincipalT = any> {
    getPrincipal: (token: TokenT) => Promise<PrincipalT | null>;
}
export declare abstract class AuthModule<TokenT extends AuthToken = AuthToken, PrincipalT = any> {
    name: string;
    opts: AuthModuleOptions<TokenT, PrincipalT>;
    constructor(name: string, opts: AuthModuleOptions<TokenT, PrincipalT>);
    abstract authorize(authScheme: string, authToken: string, req: IncomingMessage): Promise<TokenT | undefined>;
    getPrincipal(token: TokenT): Promise<PrincipalT | null>;
    register(): void;
}
export declare function getAuthModuleByName(name: string): AuthModule | null;
export declare function tryAuthorize(ctx: Context): Promise<AuthToken | null>;
export declare function authorize(ctx: Context): Promise<AuthToken>;
export declare function tryAuthorizeRequest(req: IncomingMessage): Promise<AuthToken | null>;
export declare function authorizeRequest(req: IncomingMessage): Promise<AuthToken>;
export declare function authMiddleware(ctx: Context, next: Next): Promise<unknown>;
//# sourceMappingURL=module.d.ts.map