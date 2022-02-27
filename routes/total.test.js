// jest.mock('../models');
let token = '';
const app = require('../app');
const superTest = require('supertest');
// const { Post, LikePost, sequelize } = require('../models');
describe('post', () => {

    // beforeAll(async () => {
    //     sequelize.sync({ force: false });
    //     // .then(() => {
    //     //     console.log('Database connected.');
    //     // })
    //     // .catch((err) => {
    //     //     console.error(err);
    //     // });
    // });

    test('주소요청시 status code가 200 이여야한다.', async () => {
        const res = await superTest(app).get('/');

        expect(res.status).toEqual(200);
    });

    test('이상한경로시 status code가 404이여야한다.', async () => {
        const res = await superTest(app).get('/error');

        expect(res.status).toEqual(404);
    });

    test('get post 동작확인', async () => {
        // Post.findAll = jest.fn();
        // LikePost.findAll = jest.fn();
        // Post.map = jest.fn();
        const res = await superTest(app).get('/api/posts');
        expect(res.status).toEqual(200);
    });

    // test('POST /api/register 성공 시 Status Code 201', async () => {
    //     const res = await superTest(app).post('/api/users/signup').send({
    //         userId: 'test1@gmail.com',
    //         nickname: 'test1',
    //         password: 'test1',
    //         passwordCheck: 'test1',
    //     });
    //     expect(res.status).toEqual(201);
    //     expect(res.body.message).toEqual('회원가입 성공');
    // });

    test('POST /api/login 성공 시 Status Code 201', async () => {
        const res = await superTest(app).post('/api/users/signin').send({
            userId: 'test1@gmail.com',
            password: 'test1',
        });
        expect(res.status).toEqual(200);
        expect(res.body.message).toEqual('로그인 성공');
        token = res.body.token;
    });

    // afterAll(async () => {
    //     sequelize.drop();
    //     console.log('All tables droped.');
    // });
});
