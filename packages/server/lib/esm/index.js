import { LazyBody } from '@koa-stack/body';
import { AbstractRouter } from "@koa-stack/router";
import http from 'http';
import Koa from 'koa';
export class AbstractKoaServer extends AbstractRouter {
    constructor(koa = new Koa()) {
        super();
        Object.defineProperty(this, "server", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "koa", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.koa = koa;
        // params is an alias to $touter.params
        Object.defineProperty(koa.context, 'params', {
            get() { return this.$router.params; }
        });
    }
    setup() { }
    onStart() { }
    onStop() { }
    /**
     * To be ble to use supertest directly with a KoaServer instance
    */
    address() {
        return this.server && this.server.address();
    }
    withLazyBody(opts) {
        LazyBody.install(this.koa, opts);
        return this;
    }
    callback() {
        return this.koa.callback();
    }
    createServer() {
        return http.createServer(this.callback());
    }
    installExitHooks() {
        const onSigExit = async () => {
            await this.stop();
            process.exit(0);
        };
        process.on('SIGINT', onSigExit);
        process.on('SIGTERM', onSigExit);
    }
    onServerListening() {
        // do nothing: you can print a server started message
    }
    async start(port, opts = {}) {
        await this.setup();
        // add routes
        this.koa.use(this.middleware());
        // install exit hooks
        if (this.onStart) {
            await this.onStart();
        }
        this.installExitHooks();
        // start http server
        return new Promise(resolve => {
            this.server = this.createServer();
            this.server.listen(port, opts.host, opts.backlog, () => {
                this.onServerListening();
                opts.callback && opts.callback();
                resolve(this);
            });
        });
    }
    stop() {
        return new Promise(resolve => {
            if (this.server) {
                this.server.close(async () => {
                    if (this.onStop) {
                        await this.onStop();
                    }
                    this.server = undefined;
                });
                resolve(null);
            }
        });
    }
}
export class KoaServer extends AbstractKoaServer {
}
//# sourceMappingURL=index.js.map