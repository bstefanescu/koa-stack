"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filters = filters;
exports.routes = routes;
exports.serve = serve;
exports.guard = guard;
exports.route = route;
exports.get = get;
exports.post = post;
exports.put = put;
exports.del = del;
exports.options = options;
exports.head = head;
exports.patch = patch;
exports.trace = trace;
function getOrCreateSetupChain(target) {
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
function filters(...middlewares) {
    return (constructor) => {
        const chain = getOrCreateSetupChain(constructor);
        for (const middleware of middlewares) {
            chain.push((_resource, router) => {
                router.use(middleware);
            });
        }
    };
}
function routes(map) {
    return (constructor) => {
        const chain = getOrCreateSetupChain(constructor);
        for (const key in map) {
            chain.push((_resource, router) => {
                router.mount(key, map[key]);
            });
        }
    };
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
function serve(path) {
    return (target, propertyKey, descriptor) => {
        const isGetter = !!descriptor.get;
        getOrCreateSetupChain(target.constructor).push((resource, router) => {
            const value = resource[propertyKey];
            router.serve(path, isGetter ? value : value());
        });
    };
}
function guard(target, propertyKey, _descriptor) {
    getOrCreateSetupChain(target.constructor).push((resource, router) => {
        // we only register it if not other guard was registered
        // this enables overwriting guards from derived classes
        if (!router.guard) {
            router.withGuard(resource[propertyKey].bind(resource));
        }
    });
}
function _route(method, path) {
    return (target, propertyKey, _descriptor) => {
        getOrCreateSetupChain(target.constructor).push((resource, router) => {
            router.route(method, path, resource[propertyKey], resource);
        });
    };
}
function route(method, path = '/') {
    return _route(method, path);
}
function get(path = '/') {
    return _route('GET', path);
}
function post(path = '/') {
    return _route('POST', path);
}
function put(path = '/') {
    return _route('PUT', path);
}
function del(path = '/') {
    return _route('DELETE', path);
}
function options(path = '/') {
    return _route('OPTIONS', path);
}
function head(path = '/') {
    return _route('HEAD', path);
}
function patch(path = '/') {
    return _route('PATCH', path);
}
function trace(path = '/') {
    return _route('TRACE', path);
}
//# sourceMappingURL=decorators.js.map