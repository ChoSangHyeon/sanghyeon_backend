const app = require('./app');
const superTest = require('supertest');

test('주소요청시 status code가 200 이여야한다.', async () => {
    const res = await superTest(app).get('/');

    expect(res.status).toEqual(200);
});

test('이상한경로시 status code가 404이여야한다.', async () => {
    const res = await superTest(app).get('/error');

    expect(res.status).toEqual(404);
});
