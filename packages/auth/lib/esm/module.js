import { AuthError } from './error.js';
export class AuthToken {
    constructor(module, id) {
        Object.defineProperty(this, "module", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: module
        });
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: id
        });
        Object.defineProperty(this, "_principal", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    get type() {
        return this.module.name;
    }
    get isAnonymous() {
        return false;
    }
    get email() {
        return undefined;
    }
    getPrincipal() {
        if (!this._principal) {
            this._principal = this.module.getPrincipal(this);
        }
        return this._principal;
    }
}
const MODULES = [];
export function registerAuthModule(module) {
    MODULES.push(module);
}
export class AuthModule {
    constructor(name, opts) {
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: name
        });
        Object.defineProperty(this, "opts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: opts
        });
    }
    getPrincipal(token) {
        return this.opts.getPrincipal(token);
    }
    register() {
        registerAuthModule(this);
    }
}
export function getAuthModuleByName(name) {
    for (const module of MODULES) {
        if (module.name === name)
            return module;
    }
    return null;
}
function extractAuthToken(req) {
    let authHeader = req.headers.authorization;
    if (authHeader) {
        const i = authHeader.indexOf(' ');
        if (i === -1)
            throw AuthError.malformedAuthorizationHeader();
        const authScheme = authHeader.substring(0, i).toLowerCase();
        const authToken = authHeader.substring(i + 1).trim();
        return { scheme: authScheme, token: authToken };
    }
    return null;
}
export async function tryAuthorize(ctx) {
    if (ctx.auth) {
        return ctx.auth;
    }
    const token = await tryAuthorizeRequest(ctx.req);
    if (token) {
        ctx.auth = token;
    }
    return token;
}
export async function authorize(ctx) {
    if (ctx.auth) {
        return ctx.auth;
    }
    ctx.auth = await authorizeRequest(ctx.req);
    return ctx.auth;
}
export async function tryAuthorizeRequest(req) {
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
    }
    catch (err) {
        if (err instanceof AuthError) {
            throw err;
        }
        else {
            throw AuthError.unexpectedError();
        }
    }
    return Promise.resolve(null);
}
export async function authorizeRequest(req) {
    const token = await tryAuthorizeRequest(req);
    if (!token) {
        throw AuthError.notAuthorized();
    }
    return token;
}
export async function authMiddleware(ctx, next) {
    await authorize(ctx);
    return next();
}
//# sourceMappingURL=module.js.map