import { Context, Middleware } from "koa";
import compose from "koa-compose";
import { Resource, Router, RouterSetup } from "./router.js";


function getOrCreateSetupChain(target: any): RouterSetup[] {
    if (!target.hasOwnProperty('$routerSetup')) {
        Object.defineProperty(target, '$routerSetup', {
            value: [],
            configurable: false,
            enumerable: false,
            writable: false
        });
    }
    return target.$routerSetup;
}

export function filters(...middlewares: Middleware[]) {
    return (...args: any[]) => {
        if (args.length === 1) {
            const constructor = args[0] as Function;
            return resourceFilters(constructor, middlewares);
        } else if (args.length === 3) {
            const target = args[0];
            const propertyKey = args[1] as string;
            const descriptor = args[2] as PropertyDescriptor;
            return endpointFilters(target, propertyKey, descriptor, middlewares);
        }
    }
}

function resourceFilters(constructor: Function, middlewares: Middleware[]) {
    const chain = getOrCreateSetupChain(constructor);
    for (const middleware of middlewares) {
        chain.push((_resource: any, router: Router) => {
            router.use(middleware);
        });
    }
}
function endpointFilters(_target: any, _propertyKey: string, descriptor: PropertyDescriptor, middlewares: Middleware[]) {
    const endpoint = descriptor.value as (ctx: Context) => Promise<any>;
    const filterFn = compose(middlewares);

    descriptor.value = async function (ctx: Context) {
        // This is the correct `next` function type for compose
        await filterFn(ctx, async () => {
            const result = await endpoint.call(this, ctx);
            // Set ctx.body if endpoint returned something
            // the router will not set again the body since the new endpoint
            // always returns undefined
            if (result !== undefined) {
                ctx.body = result;
            }
        });
    };
}




export type ResourceConstructor<T extends Resource = Resource> = new () => T;

export function routes(map: Record<string, Resource | ResourceConstructor>) {
    return (constructor: Function) => {
        const chain = getOrCreateSetupChain(constructor);
        for (const key in map) {
            chain.push((_resource: any, router: Router) => {
                router.mount(key, map[key]);
            });
        }
    }
}

// deprecated decorators. Use @routes and @filters instead
// export function mount(path: string) {
//     return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
//         const isGetter = !!descriptor.get;
//         getOrCreateSetupChain(target.constructor).push((resource: any, router: Router) => {
//             const value = resource[propertyKey];
//             router.mount(path, isGetter ? value : value());
//         });
//     }
// }
// export function use(target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
//     getOrCreateSetupChain(target.constructor).push((resource: any, router: Router) => {
//         router.use(resource[propertyKey].bind(resource));
//     });
// }

export function serve(path: string) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const isGetter = !!descriptor.get;
        getOrCreateSetupChain(target.constructor).push((resource: any, router: Router) => {
            const value = resource[propertyKey];
            router.serve(path, isGetter ? value : value());
        });
    }
}


export function guard(target: any, propertyKey: string, _descriptor: PropertyDescriptor): void {
    getOrCreateSetupChain(target.constructor).push((resource: any, router: Router) => {
        // we only register it if not other guard was registered
        // this enables overwriting guards from derived classes
        if (!router.guard) {
            router.withGuard(resource[propertyKey].bind(resource));
        }
    });
}

function _route(method: string, path: string) {
    return (target: any, propertyKey: string, _descriptor: PropertyDescriptor) => {
        getOrCreateSetupChain(target.constructor).push((resource: any, router: Router) => {
            router.route(method, path, resource[propertyKey], resource);
        });
    }
}

export function route(method: string, path: string = '/') {
    return _route(method, path);
}
export function get(path: string = '/') {
    return _route('GET', path);
}
export function post(path: string = '/') {
    return _route('POST', path);
}
export function put(path: string = '/') {
    return _route('PUT', path);
}
export function del(path: string = '/') {
    return _route('DELETE', path);
}
export function options(path: string = '/') {
    return _route('OPTIONS', path);
}
export function head(path: string = '/') {
    return _route('HEAD', path);
}
export function patch(path: string = '/') {
    return _route('PATCH', path);
}
export function trace(path: string = '/') {
    return _route('TRACE', path);
}

