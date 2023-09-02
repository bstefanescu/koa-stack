//import { KoaServer } from "@koa-stack/server";
import server from './server';

//import './server.tests';
import './resource.tests';

before(() => {
    server.start(9098);
});

after(() => {
    server.stop();
});
