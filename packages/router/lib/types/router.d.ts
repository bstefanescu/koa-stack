import { Context, Middleware, Next } from "koa";
import send from 'koa-send';
import { ErrorHandlerOpts } from './error.js';
import { PrefixMatcher } from './path-matchers.js';
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
export declare class RouterContext {
    params: any;
    path: string;
    matchedPattern?: string;
    _maybe405?: string;
    constructor(ctx: Context);
    update(params?: object): void;
    onMatch(matchedPattern: string, params?: object): void;
}
type RouterOpts = {
    webRoot?: string;
    errorHandlers?: ErrorHandlerOpts;
};
export declare abstract class AbstractRouter<T extends AbstractRouter<T>> implements Route {
    parent?: AbstractRouter<T>;
    _absPrefix?: string;
    prefix: string;
    prefixMatcher: PrefixMatcher;
    guard?: RouterGuard;
    routes: Route[];
    filters: Middleware[];
    filtersFn?: Middleware;
    webRoot: string;
    errorHandlerOpts?: ErrorHandlerOpts;
    constructor(prefix?: string, opts?: RouterOpts, parent?: AbstractRouter<T>);
    get absPrefix(): string;
    getAbsPath(path?: string): string;
    match(ctx: Context, path: string): boolean;
    _dispatch(ctx: Context): Promise<unknown>;
    dispatch(ctx: Context): Promise<unknown>;
    middleware(): (ctx: Context, next: Next) => Promise<any>;
    onError(ctx: Context, err: any): void;
    withGuard(guard: RouterGuard): this;
    withErrorHandler(errorHandlerOpts: ErrorHandlerOpts): this;
    withWebRoot(webRoot: string): this;
    route(method: string | null | undefined, path: string, target: RouteTarget, thisArg?: any): void;
    routeAll(path: string, target: RouteTarget): void;
    /**
     * The target can be a resource instance or resource ctor
     * @param prefix
     * @param target
     * @returns
     */
    mount(prefix: string, target?: any): Router;
    use(middleware: Middleware): void;
    serve(pattern: string, target: string, opts?: send.SendOptions): void;
    redirect(method: string | null | undefined, pattern: string, target: string, alt?: string): void;
    get(pattern: string, target: RouteTarget, thisArg?: any): void;
    head(pattern: string, target: RouteTarget, thisArg?: any): void;
    options(pattern: string, target: RouteTarget, thisArg?: any): void;
    put(pattern: string, target: RouteTarget, thisArg?: any): void;
    post(pattern: string, target: RouteTarget, thisArg?: any): void;
    delete(pattern: string, target: RouteTarget, thisArg?: any): void;
    patch(pattern: string, target: RouteTarget, thisArg?: any): void;
    trace(pattern: string, target: RouteTarget, thisArg?: any): void;
}
export declare class Router extends AbstractRouter<Router> {
}
export type RouterSetup = (resource: any, router: Router) => void;
export declare abstract class Resource {
    /**
     * Setup the router coresponding to this resource.
     * When overwriting you must always call `super.setup(router);` otherwise
     * the decortators will not be applied to the resource
     * @param router
     */
    setup(router: Router): void;
}
export {};
//# sourceMappingURL=router.d.ts.map