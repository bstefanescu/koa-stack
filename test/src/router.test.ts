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
