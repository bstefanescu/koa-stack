import { Context, Middleware, Next } from "koa";
import compose from 'koa-compose';
import send from 'koa-send';
import { join as joinPath, resolve as resolvePath } from 'path';

import { errorHandler, ErrorHandlerOpts } from './error';
import {
    createPathMatcherUnsafe, createPathPrefixMatcherUnsafe,
    createSimplePrefixMatcher,
    normalizePath,
    PathMatcher, PrefixMatcher
} from './path-matchers';
import { ServerError } from './ServerError';


declare module 'koa' {
    interface BaseContext {
        $router: RouterContext;
    }
}

export type RouteTarget = (ctx: Context) => Promise<any>;
export type RouterGuard = (ctx: Context) => boolean;

export interface Route {
    match(ctx: Context, path: string): boolean;
    dispatch(ctx: Context): Promise<unknown>;
}


export class RouterContext {
    params: any = {};
    path: string;
    matchedPattern?: string;
    // used internally to indicate that the path matched at least an endpoint but the method does not
    // in case of a 405 the value is the endpoint pattern 
    _maybe405?: string;

    constructor(ctx: Context) {
        this.path = normalizePath(ctx.path);
        ctx.$router = this;
    }

    // used by the parent router prefix matcher
    update(params?: object) {
        params && Object.assign(this.params, params);
    }

    // called on an endpoint match to update matching info
    onMatch(matchedPattern: string, params?: object) {
        this.matchedPattern = matchedPattern;
        params && Object.assign(this.params, params);
    }
}

class EndpointRoute implements Route {
    router: Router;
    pathPattern: string;
    method: string | null | undefined;
    matcher: PathMatcher;
    target: RouteTarget;
    thisArg: any;
    _absPathPattern?: string;

    constructor(router: Router, method: string | null | undefined, pathPattern: string, target: RouteTarget, thisArg?: any) {
        this.router = router;
        this.pathPattern = normalizePath(pathPattern);
        this.method = method ? method.toUpperCase() : null;
        this.matcher = createPathMatcherUnsafe(this.pathPattern);
        this.target = target;
        this.thisArg = thisArg;
    }

    get absPathPattern() {
        if (this._absPathPattern == null) {
            this._absPathPattern = this.router.getAbsPath(this.pathPattern);
        }
        return this._absPathPattern;
    }

    match(ctx: Context, path: string): boolean {
        const match = this.matcher(path);
        if (!match) {
            return false;
        }
        // path matches        
        if (this.method && this.method !== ctx.method) {
            ctx.$router._maybe405 = this.absPathPattern;
            return false;
        }
        // path and method matches
        if (match === true) {
            ctx.$router.onMatch(this.absPathPattern);
            return true;
        } else if (match) {
            ctx.$router.onMatch(this.absPathPattern, match.params);
            return true;
        } else { // should never happens
            return false;
        }
    }

    dispatch(ctx: Context) {
        try {
            return Promise.resolve(this.target.call(this.thisArg, ctx)).then(r => {
                if (r !== undefined) {
                    ctx.body = r;
                }
                return r;
            });
        } catch (err) {
            return Promise.reject(err);
        }
    }
}

/**
 * A route which serve static files given a path mapping
 */
class ServeRoute implements Route {
    matcher: PrefixMatcher;
    target: string;
    opts: send.SendOptions;

    constructor(prefix: string, target: string, opts: send.SendOptions = {}) {
        this.matcher = createSimplePrefixMatcher(normalizePath(prefix));
        this.target = target;
        this.opts = opts;
    }
    match(ctx: Context, path: string): boolean {
        switch (ctx.method) {
            case 'GET':
            case 'HEAD':
                return this.matcher(ctx, path);
            default: return false;
        }

    }
    async dispatch(ctx: Context): Promise<any> {
        let path = ctx.$router.path || '/'; // trailing path
        if (path === '/') { // exact match
            path = this.target; // rewrite exact path
        } else {
            path = this.target + path;
        }
        try {
            await send(ctx,
                path.startsWith('/') ? '.' + path : path,
                this.opts);
        } catch (err) {
            if ((err as any).code === 'ENOENT') {
                ctx.throw(404, 'File not found: ' + ctx.path);
            } else {
                ctx.throw(500, 'Failed to fetch file: ' + ctx.path);
            }
        }
    };
}

type RouterOpts = {
    webRoot?: string,
    errorHandlers?: ErrorHandlerOpts
}

export abstract class AbstractRouter<T extends AbstractRouter<T>> implements Route {
    parent?: AbstractRouter<T>;
    _absPrefix?: string;
    prefix: string;
    prefixMatcher: PrefixMatcher;
    guard?: RouterGuard;
    routes: Route[] = [];
    filters: Middleware[] = [];
    filtersFn?: Middleware;
    webRoot: string;
    errorHandlerOpts?: ErrorHandlerOpts;

    constructor(prefix: string = '/', opts: RouterOpts = {}, parent?: AbstractRouter<T>) {
        this.prefix = normalizePath(prefix);
        this.webRoot = opts.webRoot || process.cwd();
        this.errorHandlerOpts = opts.errorHandlers;
        this.prefixMatcher = createPathPrefixMatcherUnsafe(this.prefix);
        this.parent = parent;
    }

    get absPrefix(): string {
        if (this._absPrefix == null) {
            this._absPrefix = this.parent ? this.parent.getAbsPath(this.prefix) : this.prefix;
        }
        return this._absPrefix;
    }

    getAbsPath(path?: string) {
        let abspath = path ? joinPath(this.absPrefix, path) : this.prefix;
        return normalizePath(abspath);
    }

    match(ctx: Context, path: string) {
        return this.prefixMatcher(ctx, path);
    }

    async _dispatch(ctx: Context): Promise<unknown> {
        if (this.guard) {
            if (!await this.guard(ctx)) {
                ctx.throw(401);
            }
        }
        const path = ctx.$router.path;
        for (const route of this.routes) {
            if (route.match(ctx, path)) {
                return await route.dispatch(ctx);
            }
        }
        //TODO add support for 405 method not allowed
        if (ctx.$router._maybe405) {
            throw new ServerError(405, 'Method ' + ctx.method + ' not allowed on endpoint ' + ctx.$router._maybe405);
            //ctx.throw(405, 'Method ' + ctx.method + ' not allowed on endpoint ' + ctx.$router._maybe405);
        } else {
            ctx.throw(404);
        }
    }

    async dispatch(ctx: Context): Promise<unknown> {
        try {
            if (this.filters.length > 0) {
                // lazy build filters since we can add filter after registering the router
                if (!this.filtersFn) {
                    this.filtersFn = compose(this.filters);
                }
                return await this.filtersFn(ctx, () => {
                    try {
                        return Promise.resolve(this._dispatch(ctx));
                    } catch (err) {
                        return Promise.reject(err);
                    }
                });
            } else {
                return await this._dispatch(ctx);
            }
        } catch (err) {
            return await this.onError(ctx, err);
        }
    }


    middleware() {
        return (ctx: Context, next: Next) => {
            const $router = ctx.$router = new RouterContext(ctx);
            if (this.match(ctx, $router.path)) {
                // we never call next since the router is an endpoint
                return this.dispatch(ctx);
            } else {
                return next();
            }
        }
    }

    onError(ctx: Context, err: any): void {
        return errorHandler(ctx, err, { htmlRoot: joinPath(this.webRoot, '/errors'), ...this.errorHandlerOpts });
    }

    withGuard(guard: RouterGuard) {
        this.guard = guard;
        return this;
    }

    withErrorHandler(errorHandlerOpts: ErrorHandlerOpts) {
        this.errorHandlerOpts = errorHandlerOpts;
        return this;
    }

    withWebRoot(webRoot: string) {
        this.webRoot = webRoot;
        return this;
    }

    route(method: string | null | undefined, path: string, target: RouteTarget, thisArg?: any) {
        this.routes.push(new EndpointRoute(this, method, path, target, thisArg));
    }

    routeAll(path: string, target: RouteTarget) {
        this.route(null, path, target);
    }

    /**
     * The target can be a resource instance or resource ctor
     * @param prefix
     * @param target
     * @returns
     */
    mount(prefix: string, target?: any) {
        const router = new Router(prefix, { webRoot: this.webRoot }, this);
        // inherit error handling from parent router
        this.errorHandlerOpts && router.withErrorHandler(this.errorHandlerOpts);
        if (target) {
            if (target instanceof Resource) {
                target.setup(router);
            } else if (target.prototype instanceof Resource) {
                const resource = new target();
                resource.setup(router);
            } else {
                throw new Error('Unsupported router resource: ' + target);
            }
        }
        this.routes.push(router);
        return router;
    }

    use(middleware: Middleware) {
        this.filters.push(middleware);
    }

    serve(pattern: string, target: string, opts: send.SendOptions = {}) {
        if (!opts.root) opts.root = this.webRoot;
        this.routes.push(new ServeRoute(pattern, resolvePath(this.webRoot, target), opts));
    }

    redirect(method: string | null | undefined, pattern: string, target: string, alt?: string) {
        this.route(method, pattern, (ctx) => {
            ctx.redirect(target, alt);
            return Promise.resolve();
        });
    }

    get(pattern: string, target: RouteTarget, thisArg?: any) {
        this.route('GET', pattern, target, thisArg);
    }
    head(pattern: string, target: RouteTarget, thisArg?: any) {
        this.route('HED', pattern, target, thisArg);
    }
    options(pattern: string, target: RouteTarget, thisArg?: any) {
        this.route('OPTIONS', pattern, target, thisArg);
    }
    put(pattern: string, target: RouteTarget, thisArg?: any) {
        this.route('PUT', pattern, target, thisArg);
    }
    post(pattern: string, target: RouteTarget, thisArg?: any) {
        this.route('POST', pattern, target, thisArg);
    }
    delete(pattern: string, target: RouteTarget, thisArg?: any) {
        this.route('DELETE', pattern, target, thisArg);
    }
    patch(pattern: string, target: RouteTarget, thisArg?: any) {
        this.route('PATCH', pattern, target, thisArg);
    }
    trace(pattern: string, target: RouteTarget, thisArg?: any) {
        this.route('TRACE', pattern, target, thisArg);
    }
}
export class Router extends AbstractRouter<Router> {
}


export type RouterSetup = (resource: any, router: Router) => void;
export abstract class Resource {
    /**
     * Setup the router coresponding to this resource.
     * When overwriting you must always call `super.setup(router);` otherwise
     * the decortators will not be applied to the resource
     * @param router
     */
    setup(router: Router) {
        let ctor = this.constructor as any;
        while (ctor && ctor !== Resource) {
            // setup decorators registered on ctor
            if (Array.isArray(ctor.$routerSetup)) {
                for (const setup of ctor.$routerSetup) {
                    setup(this, router);
                }
            }
            ctor = Object.getPrototypeOf(ctor);
        }
    }
}

