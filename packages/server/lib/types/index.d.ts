import { LazyBodyOpts } from '@koa-stack/body';
import { AbstractRouter } from "@koa-stack/router";
import http from 'http';
import Koa from 'koa';
declare module 'koa' {
    interface BaseContext {
        params: Record<string, string>;
    }
}
export declare abstract class AbstractKoaServer<T extends AbstractKoaServer<T>> extends AbstractRouter<T> {
    server?: http.Server;
    koa: Koa;
    constructor(koa?: Koa);
    setup(): void;
    onStart(): void;
    onStop(): void;
    /**
     * To be ble to use supertest directly with a KoaServer instance
    */
    address(): string | import("net").AddressInfo | null | undefined;
    withLazyBody(opts?: LazyBodyOpts): this;
    callback(): (req: http.IncomingMessage | import("http2").Http2ServerRequest, res: http.ServerResponse | import("http2").Http2ServerResponse) => Promise<void>;
    createServer(): http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
    installExitHooks(): void;
    onServerListening(): void;
    start(port: number, opts?: {
        host?: string;
        backlog?: number;
        callback?: () => void;
    }): Promise<unknown>;
    stop(): Promise<unknown>;
}
export declare class KoaServer extends AbstractKoaServer<KoaServer> {
}
//# sourceMappingURL=index.d.ts.map