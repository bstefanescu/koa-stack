import { describe, test, expect } from 'vitest';
import request from 'supertest';

const server = "http://localhost:9098"

describe('Test router features', () => {

    test('handle 405 errors', () => {
        return request(server).head('/router-test/hello').then((res) => {
            expect(res.status).to.be.equal(405);
        });
    });
    test('existing method works', () => {
        return request(server).get('/router-test/hello').then((res) => {
            expect(res.status).to.be.equal(200);
        });
    });

    test('nested routers works', () => {
        return request(server).get('/api-other/child/hello').then((res) => {
            expect(res.status).to.be.equal(200);
        });
    });

});


describe('Test @filters decorator', () => {
    test('filters on class and endpoints are working', async () => {
        const res = await request(server).get('/api/filters').expect(200);
        expect(res.text).to.be.equal("resource,endpoint");
    });
    test('guard filters on methods', async () => {
        let res = await request(server).post('/api/filters/knock').type("text/plain").send("knock knock").expect(200);
        expect(res.text).to.be.equal("hello");
        res = await request(server).post('/api/filters/knock').type("text/plain").send("knock").expect(403);
    });
});


describe('Test @intercept decorator', () => {
    test('@intecept is working', async () => {
        const res = await request(server).get('/api/intercept/test1').expect(200);
        expect(res.text).to.be.equal("intercepted: hello");
    });
});

