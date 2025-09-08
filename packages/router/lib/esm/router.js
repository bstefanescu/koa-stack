import compose from 'koa-compose';
import send from 'koa-send';
import { join as joinPath, resolve as resolvePath } from 'path';
import { errorHandler } from './error.js';
import { createPathMatcherUnsafe, createPathPrefixMatcherUnsafe, createSimplePrefixMatcher, normalizePath } from './path-matchers.js';
import { ServerError } from './ServerError.js';
export class RouterContext {
    constructor(ctx) {
        Object.defineProperty(this, "params", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "path", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "matchedPattern", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // used internally to indicate that the path matched at least an endpoint but the method does not
        // in case of a 405 the value is the endpoint pattern 
        Object.defineProperty(this, "_maybe405", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.path = normalizePath(ctx.path);
        ctx.$router = this;
    }
    // used by the parent router prefix matcher
    update(params) {
        params && Object.assign(this.params, params);
    }
    // called on an endpoint match to update matching info
    onMatch(matchedPattern, params) {
        this.matchedPattern = matchedPattern;
        params && Object.assign(this.params, params);
    }
}
class EndpointRoute {
    constructor(router, method, pathPattern, target, thisArg) {
        Object.defineProperty(this, "router", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "pathPattern", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "method", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "matcher", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "target", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "thisArg", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_absPathPattern", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
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
    match(ctx, path) {
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
        }
        else if (match) {
            ctx.$router.onMatch(this.absPathPattern, match.params);
            return true;
        }
        else { // should never happens
            return false;
        }
    }
    dispatch(ctx) {
        try {
            return Promise.resolve(this.target.call(this.thisArg, ctx)).then(r => {
                if (r !== undefined) {
                    ctx.body = r;
                }
                return r;
            });
        }
        catch (err) {
            return Promise.reject(err);
        }
    }
}
/**
 * A route which serve static files given a path mapping
 */
class ServeRoute {
    constructor(prefix, target, opts = {}) {
        Object.defineProperty(this, "matcher", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "target", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "opts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.matcher = createSimplePrefixMatcher(normalizePath(prefix));
        this.target = target;
        this.opts = opts;
    }
    match(ctx, path) {
        switch (ctx.method) {
            case 'GET':
            case 'HEAD':
                return this.matcher(ctx, path);
            default: return false;
        }
    }
    async dispatch(ctx) {
        let path = ctx.$router.path || '/'; // trailing path
        if (path === '/') { // exact match
            path = this.target; // rewrite exact path
        }
        else {
            path = this.target + path;
        }
        try {
            await send(ctx, path.startsWith('/') ? '.' + path : path, this.opts);
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                ctx.throw(404, 'File not found: ' + ctx.path);
            }
            else {
                ctx.throw(500, 'Failed to fetch file: ' + ctx.path);
            }
        }
    }
    ;
}
export class AbstractRouter {
    constructor(prefix = '/', opts = {}, parent) {
        Object.defineProperty(this, "parent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_absPrefix", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "prefix", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "prefixMatcher", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "guard", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "routes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "filters", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "filtersFn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "webRoot", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "errorHandlerOpts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.prefix = normalizePath(prefix);
        this.webRoot = opts.webRoot || process.cwd();
        this.errorHandlerOpts = opts.errorHandlers;
        this.prefixMatcher = createPathPrefixMatcherUnsafe(this.prefix);
        this.parent = parent;
    }
    get absPrefix() {
        if (this._absPrefix == null) {
            this._absPrefix = this.parent ? this.parent.getAbsPath(this.prefix) : this.prefix;
        }
        return this._absPrefix;
    }
    getAbsPath(path) {
        let abspath = path ? joinPath(this.absPrefix, path) : this.prefix;
        return normalizePath(abspath);
    }
    match(ctx, path) {
        return this.prefixMatcher(ctx, path);
    }
    async _dispatch(ctx) {
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
        }
        else {
            ctx.throw(404);
        }
    }
    async dispatch(ctx) {
        try {
            if (this.filters.length > 0) {
                // lazy build filters since we can add filter after registering the router
                if (!this.filtersFn) {
                    this.filtersFn = compose(this.filters);
                }
                return await this.filtersFn(ctx, () => {
                    try {
                        return Promise.resolve(this._dispatch(ctx));
                    }
                    catch (err) {
                        return Promise.reject(err);
                    }
                });
            }
            else {
                return await this._dispatch(ctx);
            }
        }
        catch (err) {
            return await this.onError(ctx, err);
        }
    }
    middleware() {
        return (ctx, next) => {
            const $router = ctx.$router = new RouterContext(ctx);
            if (this.match(ctx, $router.path)) {
                // we never call next since the router is an endpoint
                return this.dispatch(ctx);
            }
            else {
                return next();
            }
        };
    }
    onError(ctx, err) {
        return errorHandler(ctx, err, { htmlRoot: joinPath(this.webRoot, '/errors'), ...this.errorHandlerOpts });
    }
    withGuard(guard) {
        this.guard = guard;
        return this;
    }
    withErrorHandler(errorHandlerOpts) {
        this.errorHandlerOpts = errorHandlerOpts;
        return this;
    }
    withWebRoot(webRoot) {
        this.webRoot = webRoot;
        return this;
    }
    route(method, path, target, thisArg) {
        this.routes.push(new EndpointRoute(this, method, path, target, thisArg));
    }
    routeAll(path, target) {
        this.route(null, path, target);
    }
    /**
     * The target can be a resource instance or resource ctor
     * @param prefix
     * @param target
     * @returns
     */
    mount(prefix, target) {
        const router = new Router(prefix, { webRoot: this.webRoot }, this);
        // inherit error handling from parent router
        this.errorHandlerOpts && router.withErrorHandler(this.errorHandlerOpts);
        if (target) {
            if (target instanceof Resource) {
                target.setup(router);
            }
            else if (target.prototype instanceof Resource) {
                const resource = new target();
                resource.setup(router);
            }
            else {
                throw new Error('Unsupported router resource: ' + target);
            }
        }
        this.routes.push(router);
        return router;
    }
    use(middleware) {
        this.filters.push(middleware);
    }
    serve(pattern, target, opts = {}) {
        if (!opts.root)
            opts.root = this.webRoot;
        this.routes.push(new ServeRoute(pattern, resolvePath(this.webRoot, target), opts));
    }
    redirect(method, pattern, target, alt) {
        this.route(method, pattern, (ctx) => {
            ctx.redirect(target, alt);
            return Promise.resolve();
        });
    }
    get(pattern, target, thisArg) {
        this.route('GET', pattern, target, thisArg);
    }
    head(pattern, target, thisArg) {
        this.route('HED', pattern, target, thisArg);
    }
    options(pattern, target, thisArg) {
        this.route('OPTIONS', pattern, target, thisArg);
    }
    put(pattern, target, thisArg) {
        this.route('PUT', pattern, target, thisArg);
    }
    post(pattern, target, thisArg) {
        this.route('POST', pattern, target, thisArg);
    }
    delete(pattern, target, thisArg) {
        this.route('DELETE', pattern, target, thisArg);
    }
    patch(pattern, target, thisArg) {
        this.route('PATCH', pattern, target, thisArg);
    }
    trace(pattern, target, thisArg) {
        this.route('TRACE', pattern, target, thisArg);
    }
}
export class Router extends AbstractRouter {
}
export class Resource {
    /**
     * Setup the router coresponding to this resource.
     * When overwriting you must always call `super.setup(router);` otherwise
     * the decortators will not be applied to the resource
     * @param router
     */
    setup(router) {
        let ctor = this.constructor;
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
//# sourceMappingURL=router.js.map