import { Middleware } from "koa";
import { Resource } from "./router.js";
export declare function filters(...middlewares: Middleware[]): (constructor: Function) => void;
export type ResourceConstructor<T extends Resource = Resource> = new () => T;
export declare function routes(map: Record<string, Resource | ResourceConstructor>): (constructor: Function) => void;
export declare function serve(path: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function guard(target: any, propertyKey: string, _descriptor: PropertyDescriptor): void;
export declare function route(method: string, path?: string): (target: any, propertyKey: string, _descriptor: PropertyDescriptor) => void;
export declare function get(path?: string): (target: any, propertyKey: string, _descriptor: PropertyDescriptor) => void;
export declare function post(path?: string): (target: any, propertyKey: string, _descriptor: PropertyDescriptor) => void;
export declare function put(path?: string): (target: any, propertyKey: string, _descriptor: PropertyDescriptor) => void;
export declare function del(path?: string): (target: any, propertyKey: string, _descriptor: PropertyDescriptor) => void;
export declare function options(path?: string): (target: any, propertyKey: string, _descriptor: PropertyDescriptor) => void;
export declare function head(path?: string): (target: any, propertyKey: string, _descriptor: PropertyDescriptor) => void;
export declare function patch(path?: string): (target: any, propertyKey: string, _descriptor: PropertyDescriptor) => void;
export declare function trace(path?: string): (target: any, propertyKey: string, _descriptor: PropertyDescriptor) => void;
//# sourceMappingURL=decorators.d.ts.map