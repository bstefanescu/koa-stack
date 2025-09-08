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
export function filters(...middlewares) {
    return (constructor) => {
        const chain = getOrCreateSetupChain(constructor);
        for (const middleware of middlewares) {
            chain.push((_resource, router) => {
                router.use(middleware);
            });
        }
    };
}
export function routes(map) {
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
export function serve(path) {
    return (target, propertyKey, descriptor) => {
        const isGetter = !!descriptor.get;
        getOrCreateSetupChain(target.constructor).push((resource, router) => {
            const value = resource[propertyKey];
            router.serve(path, isGetter ? value : value());
        });
    };
}
export function guard(target, propertyKey, _descriptor) {
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
export function route(method, path = '/') {
    return _route(method, path);
}
export function get(path = '/') {
    return _route('GET', path);
}
export function post(path = '/') {
    return _route('POST', path);
}
export function put(path = '/') {
    return _route('PUT', path);
}
export function del(path = '/') {
    return _route('DELETE', path);
}
export function options(path = '/') {
    return _route('OPTIONS', path);
}
export function head(path = '/') {
    return _route('HEAD', path);
}
export function patch(path = '/') {
    return _route('PATCH', path);
}
export function trace(path = '/') {
    return _route('TRACE', path);
}
//# sourceMappingURL=decorators.js.map