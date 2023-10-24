import { AuthToken } from './module';

export * from './module';
export * from './error';
export * from './apikey';
export * from './anonymous';

declare module 'koa' {
    interface BaseContext {
        auth?: AuthToken;
    }
}
