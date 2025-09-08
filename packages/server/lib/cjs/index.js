"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KoaServer = exports.AbstractKoaServer = void 0;
const body_1 = require("@koa-stack/body");
const router_1 = require("@koa-stack/router");
const http_1 = __importDefault(require("http"));
const koa_1 = __importDefault(require("koa"));
class AbstractKoaServer extends router_1.AbstractRouter {
    constructor(koa = new koa_1.default()) {
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
        body_1.LazyBody.install(this.koa, opts);
        return this;
    }
    callback() {
        return this.koa.callback();
    }
    createServer() {
        return http_1.default.createServer(this.callback());
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
exports.AbstractKoaServer = AbstractKoaServer;
class KoaServer extends AbstractKoaServer {
}
exports.KoaServer = KoaServer;
//# sourceMappingURL=index.js.map