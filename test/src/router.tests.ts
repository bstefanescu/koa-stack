import request from 'supertest';
import server from './server';
import { expect } from 'chai';

describe('Test router features', () => {

    it('handle 405 errors', done => {
        request(server).head('/router-test/hello').then((res) => {
            expect(res.status).to.be.equal(405);
            done();
        });
    });
    it('methode match works', done => {
        request(server).get('/router-test/hello').then((res) => {
            expect(res.status).to.be.equal(200);
            done();
        });
    });

});
