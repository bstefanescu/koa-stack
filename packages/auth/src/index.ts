import { AuthToken } from './module.js';

export * from './module.js';
export * from './error.js';
export * from './apikey.js';
export * from './anonymous.js';

declare module 'koa' {
    interface BaseContext {
        auth?: AuthToken;
    }
}
