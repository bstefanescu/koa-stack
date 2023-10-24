import { IncomingMessage } from 'http';
import { Context, Next } from 'koa';
import { AuthError } from './error.js';

export abstract class AuthToken<PrincipalT = any> {
    _principal: Promise<any> | undefined;
    constructor(public module: AuthModule<any, PrincipalT>, public id: string) {
    }
    get type() {
        return this.module.name;
    }

    get isAnonymous() {
        return false;
    }

    get email(): string | undefined {
        return undefined;
    }

    getPrincipal(): Promise<PrincipalT | null> {
        if (!this._principal) {
            this._principal = this.module.getPrincipal(this);
        }
        return this._principal;
    }
}


const MODULES: AuthModule<any>[] = [];

export function registerAuthModule(module: AuthModule<any>) {
    MODULES.push(module);
}

export interface AuthModuleOptions<TokenT extends AuthToken, PrincipalT = any> {
    getPrincipal: (token: TokenT) => Promise<PrincipalT | null>,
}
export abstract class AuthModule<TokenT extends AuthToken = AuthToken, PrincipalT = any> {

    constructor(public name: string, public opts: AuthModuleOptions<TokenT, PrincipalT>) {
    }

    abstract authorize(authScheme: string, authToken: string, req: IncomingMessage): Promise<TokenT | undefined>;

    getPrincipal(token: TokenT): Promise<PrincipalT | null> {
        return this.opts.getPrincipal(token);
    }

    register() {
        registerAuthModule(this);
    }
}

export function getAuthModuleByName(name: string): AuthModule | null {
    for (const module of MODULES) {
        if (module.name === name) return module;
    }
    return null;
}


function extractAuthToken(req: IncomingMessage): { scheme: string, token: string } | null {
    let authHeader = req.headers.authorization;
    if (authHeader) {
        const i = authHeader.indexOf(' ');
        if (i === -1) throw AuthError.malformedAuthorizationHeader();
        const authScheme = authHeader.substring(0, i).toLowerCase();
        const authToken = authHeader.substring(i + 1).trim();
        return { scheme: authScheme, token: authToken };
    }
    return null;
}

export async function tryAuthorize(ctx: Context): Promise<AuthToken | null> {
    if (ctx.auth) {
        return ctx.auth;
    }
    const token = await tryAuthorizeRequest(ctx.req);
    if (token) {
        ctx.auth = token;
    }
    return token;
}

export async function authorize(ctx: Context): Promise<AuthToken> {
    if (ctx.auth) {
        return ctx.auth;
    }
    ctx.auth = await authorizeRequest(ctx.req);
    return ctx.auth;
}

export async function tryAuthorizeRequest(req: IncomingMessage): Promise<AuthToken | null> {
    try {
        let auth = extractAuthToken(req);
        if (auth) {
            for (const module of MODULES) {
                const token = await module.authorize(auth.scheme, auth.token, req);
                if (token) {
                    return token;
                }
            }
        }
    } catch (err) {
        if (err instanceof AuthError) {
            throw err;
        } else {
            throw AuthError.unexpectedError();
        }
    }
    return Promise.resolve(null);
}

export async function authorizeRequest(req: IncomingMessage): Promise<AuthToken> {
    const token = await tryAuthorizeRequest(req);
    if (!token) {
        throw AuthError.notAuthorized();
    }
    return token;
}

export async function authMiddleware(ctx: Context, next: Next): Promise<unknown> {
    await authorize(ctx);
    return next();
}