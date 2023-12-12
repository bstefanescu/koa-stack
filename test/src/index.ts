//import { KoaServer } from "@koa-stack/server";
import server from './server';

import './server.tests';
import './resource.tests';
import './router.tests';
import { ApiRoot, ApiRootBad, OtherApi } from './api-root';
import { Context, Next } from 'koa';

before(() => {
    server.start(9098);

    server.mount('/api', ApiRoot);
    // test mount instance instead of class
    server.mount('/api-bad', new ApiRootBad());
    server.mount('/api-other', OtherApi);

    server.get('/', async (ctx: Context) => {
        ctx.body = 'hello';
    });

    server.mount('/router-test', ApiRoot);
});

after(() => {
    server.stop();
});
