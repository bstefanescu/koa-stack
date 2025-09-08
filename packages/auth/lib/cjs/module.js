"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = exports.AuthToken = void 0;
exports.registerAuthModule = registerAuthModule;
exports.getAuthModuleByName = getAuthModuleByName;
exports.tryAuthorize = tryAuthorize;
exports.authorize = authorize;
exports.tryAuthorizeRequest = tryAuthorizeRequest;
exports.authorizeRequest = authorizeRequest;
exports.authMiddleware = authMiddleware;
const error_js_1 = require("./error.js");
class AuthToken {
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
exports.AuthToken = AuthToken;
const MODULES = [];
function registerAuthModule(module) {
    MODULES.push(module);
}
class AuthModule {
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
exports.AuthModule = AuthModule;
function getAuthModuleByName(name) {
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
            throw error_js_1.AuthError.malformedAuthorizationHeader();
        const authScheme = authHeader.substring(0, i).toLowerCase();
        const authToken = authHeader.substring(i + 1).trim();
        return { scheme: authScheme, token: authToken };
    }
    return null;
}
async function tryAuthorize(ctx) {
    if (ctx.auth) {
        return ctx.auth;
    }
    const token = await tryAuthorizeRequest(ctx.req);
    if (token) {
        ctx.auth = token;
    }
    return token;
}
async function authorize(ctx) {
    if (ctx.auth) {
        return ctx.auth;
    }
    ctx.auth = await authorizeRequest(ctx.req);
    return ctx.auth;
}
async function tryAuthorizeRequest(req) {
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
        if (err instanceof error_js_1.AuthError) {
            throw err;
        }
        else {
            throw error_js_1.AuthError.unexpectedError();
        }
    }
    return Promise.resolve(null);
}
async function authorizeRequest(req) {
    const token = await tryAuthorizeRequest(req);
    if (!token) {
        throw error_js_1.AuthError.notAuthorized();
    }
    return token;
}
async function authMiddleware(ctx, next) {
    await authorize(ctx);
    return next();
}
//# sourceMappingURL=module.js.map