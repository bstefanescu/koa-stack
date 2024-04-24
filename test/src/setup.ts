import { Context } from 'koa';
import { ApiRoot, ApiRootBad, OtherApi } from './api-root';
import { KoaServer } from "@koa-stack/server";

const server = new KoaServer();

export function setup() {
    server.start(9098);

    server.mount('/api', ApiRoot);
    // test mount instance instead of class
    server.mount('/api-bad', new ApiRootBad());
    server.mount('/api-other', OtherApi);

    server.get('/', async (ctx: Context) => {
        ctx.body = 'hello';
    });

    server.mount('/router-test', ApiRoot);
    // server.use(async (ctx: Context, next: Next) => {
    //     await next();
    //     console.log('>>>>>>>router', ctx.$router);
    // });
}

export function teardown() {
    server.stop();
}
