import assert from 'assert';
import request from 'supertest';
import server from './server';

describe('Test router resources inheritance', () => {

    it('return from endpoint set the payload', done => {
        request(server).get('/api/return').expect(200).then(res => {
            assert.equal(res.text, 'returned payload');
            done();
        })
    });

    it('can define own endpoint', done => {
        request(server).get('/api/hello').expect(200).then(res => {
            assert.equal(res.text, 'hello');
            done();
        })
    });

    it('can define base endpoint', done => {
        request(server).get('/api/base').expect(200).then(res => {
            assert.equal(res.text, 'hello base');
            done();
        })
    });

    it('can overwrite base endpoint method', done => {
        request(server).get('/api/overwrite').expect(200).then(res => {
            try {
                assert.equal(res.text, 'ApiRoot overwrite');
                done();
            } catch (e) {
                done(e);
            }
        })
    });

    it('can overwrite base access guard method', done => {
        request(server).get('/api/hello').expect(200).then(res => {
            try {
                assert.equal(res.text, 'hello');
                assert.equal(res.header['on-access'], 'ApiRoot');
                done();
            } catch (e) {
                done(e);
            }
        })
    });

    it('can overwrite base access guard decorator', done => {
        request(server).get('/api-bad').expect(200).then(res => {
            try {
                assert.equal(res.text, 'ApiRootBad root');
                done();
            } catch (e) {
                done(e);
            }
        })
    });

    it('can overwrite base endpoint decorator', done => {
        request(server).get('/api-bad/overwrite').expect(200).then(res => {
            try {
                assert.equal(res.text, 'ApiRootBad overwrite');
                done();
            } catch (e) {
                done(e);
            }
        })
    });

    it('own decorators are not modifying base resource routes', done => {
        request(server).get('/api-bad/hello').expect(404).then(res => {
            done();
        })
    });

    it('base access guard is inherited', done => {
        request(server).get('/api-other/').expect(200).then(res => {
            try {
                assert.equal(res.text, 'OtherApi root');
                assert.equal(res.header['on-access'], 'BaseResource');
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    it('access guard is working', done => {
        request(server).get('/api-other/').set('authorization', 'none').expect(401).then(res => {
            done();
        });
    });

    it('@routes is working given a resource class', done => {
        request(server).get('/api-other/users1').expect(200).then(res => {
            try {
                assert.equal(res.text, 'UsersApi root');
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    it('@routes is working given a resource instance', done => {
        request(server).get('/api-other/users2').expect(200).then(res => {
            try {
                assert.equal(res.text, 'UsersApi root');
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    it('setup is working', done => {
        request(server).get('/api-other/users3').expect(200).then(res => {
            try {
                assert.equal(res.text, 'UsersApi root');
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    it('@serve on exact path is working', done => {
        request(server).get('/api-other/index.txt').expect(200).then(res => {
            try {
                assert.equal(res.text, 'index.txt');
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    it('@serve on prefix path is working', done => {
        request(server).get('/api-other/static/hello.txt').expect(200).then(res => {
            try {
                assert.equal(res.text, 'hello.txt');
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    it('@filters is working', done => {
        request(server).get('/api-other/noContent').expect(204).then(res => {
            done();
        });
    });

});
