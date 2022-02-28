let token = '';
const app = require('../../app');
const superTest = require('supertest');
// const sequelize = require('../../models');

describe('total', () => {
    // beforeAll(async () => {
    //     sequelize
    //         .sync({ force: false })
    //         .then(() => {
    //             console.log('Database connected.');
    //         })
    //         .catch((err) => {
    //             console.error(err);
    //         });
    // });
    describe('기본요청', () => {
        test('주소요청시 status code가 200 이여야한다.', async () => {
            const res = await superTest(app).get('/');

            expect(res.status).toEqual(200);
        });

        test('이상한경로시 status code가 404이여야한다.', async () => {
            const res = await superTest(app).get('/error');

            expect(res.status).toEqual(404);
        });
    });

    test('get post 동작확인', async () => {
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
    test('회원가입 실패(비밀번호틀림)', async () => {
        const res = await superTest(app).post('/api/users/signup').send({
            userId: 'test1@gmail.com',
            nickname: 'test1',
            password: 'test1',
            passwordCheck: 'test112',
        });
        expect(res.status).toEqual(400);
        expect(res.body.message).toEqual(
            '패스워드가 패스워드 확인란과 동일하지 않습니다.'
        );
    });
    test('회원가입 실패(아이디존재)', async () => {
        const res = await superTest(app).post('/api/users/signup').send({
            userId: 'test1@gmail.com',
            nickname: 'test1',
            password: 'test1',
            passwordCheck: 'test1',
        });
        expect(res.status).toEqual(400);
        expect(res.body.message).toEqual(
            '이미 가입된 이메일 또는 닉네임이 있습니다.'
        );
    });
    test('로그인 실패(없는아이디)', async () => {
        const res = await superTest(app).post('/api/users/signin').send({
            userId: 'error@gmail.com',
            password: 'test1',
        });
        expect(res.status).toEqual(400);
        expect(res.body.message).toEqual(
            '이메일 또는 패스워드가 잘못됐습니다.'
        );
    });
    test('로그인 실패(비밀번호 틀림)', async () => {
        const res = await superTest(app).post('/api/users/signin').send({
            userId: 'test1@gmail.com',
            password: 'test1',
        });
        expect(res.status).toEqual(400);
        expect(res.body.message).toEqual(
            '이메일 또는 패스워드가 잘못됐습니다.'
        );
    });

    test('로그인 성공', async () => {
        const res = await superTest(app).post('/api/users/signin').send({
            userId: 'test1@gmail.com',
            password: 'test1',
        });
        expect(res.status).toEqual(200);
        expect(res.body.message).toEqual('로그인 성공');
        token = res.body.token;
    });
    test('로그인 인증', async () => {
        const res = await superTest(app)
            .post('/api/users/me')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toEqual(200);
        expect(res.body.message).toEqual('사용자인증완료');
    });

    test('게시글쓰기 성공', async () => {
        const res = await superTest(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({
                images: 'https://w.namu.la/s/96f05e961ab1169f6f0ef41902388df4832baabd91f44e79ad4b83a2eb53439831f02378ce10fe4073f627f25ac31fcfe3de93161fc5d171902c77b9159aa9178d7e546c91f9dd9c6a9d7e2e70009cac1a7bc74a6c14dda82e9618e3f4fc110cb305848dc8518df8173f38887101fa7d',
                desc: '사과2',
            });
        expect(res.status).toEqual(200);
    });
    test('게시글쓰기 실패', async () => {
        const res = await superTest(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({
                images: 'https://w.namu.la/s/96f05e961ab1169f6f0ef41902388df4832baabd91f44e79ad4b83a2eb53439831f02378ce10fe4073f627f25ac31fcfe3de93161fc5d171902c77b9159aa9178d7e546c91f9dd9c6a9d7e2e70009cac1a7bc74a6c14dda82e9618e3f4fc110cb305848dc8518df8173f38887101fa7d',
            });
        expect(res.status).toEqual(400);
    });

    test('게시글 수정 성공', async () => {
        const res = await superTest(app)
            .put('/api/posts/1')
            .set('Authorization', `Bearer ${token}`)
            .send({
                images: 'https://w.namu.la/s/96f05e961ab1169f6f0ef41902388df4832baabd91f44e79ad4b83a2eb53439831f02378ce10fe4073f627f25ac31fcfe3de93161fc5d171902c77b9159aa9178d7e546c91f9dd9c6a9d7e2e70009cac1a7bc74a6c14dda82e9618e3f4fc110cb305848dc8518df8173f38887101fa7d',
                desc: '바뀐사과',
            });
        expect(res.status).toEqual(200);
    });
    test('게시글 수정실패(토큰없음)', async () => {
        const res = await superTest(app).put('/api/posts/1').send({
            images: 'https://w.namu.la/s/96f05e961ab1169f6f0ef41902388df4832baabd91f44e79ad4b83a2eb53439831f02378ce10fe4073f627f25ac31fcfe3de93161fc5d171902c77b9159aa9178d7e546c91f9dd9c6a9d7e2e70009cac1a7bc74a6c14dda82e9618e3f4fc110cb305848dc8518df8173f38887101fa7d',
            desc: '바뀐사과',
        });
        expect(res.status).toEqual(401);
    });
    test('게시글 수정실패(본문없음)', async () => {
        const res = await superTest(app)
            .put('/api/posts/1')
            .set('Authorization', `Bearer ${token}`)
            .send({
                images: 'https://w.namu.la/s/96f05e961ab1169f6f0ef41902388df4832baabd91f44e79ad4b83a2eb53439831f02378ce10fe4073f627f25ac31fcfe3de93161fc5d171902c77b9159aa9178d7e546c91f9dd9c6a9d7e2e70009cac1a7bc74a6c14dda82e9618e3f4fc110cb305848dc8518df8173f38887101fa7d',
            });
        expect(res.status).toEqual(400);
    });
    test('댓글 조회', async () => {
        const res = await superTest(app).get('/api/posts/1/comments');
        expect(res.status).toEqual(200);
    });
    test('댓글작성', async () => {
        const res = await superTest(app)
            .post('/api/posts/1/comment')
            .set('Authorization', `Bearer ${token}`)
            .send({ commentText: 'hi' });
        expect(res.status).toEqual(200);
    });
    test('댓글작성(실패)', async () => {
        const res = await superTest(app)
            .post('/api/posts/1/comment')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toEqual(400);
        expect(res.body.message).toEqual('댓글을 입력해주세요');
    });
    test('댓글 수정', async () => {
        const res = await superTest(app)
            .put('/api/posts/1/comment/1')
            .set('Authorization', `Bearer ${token}`)
            .send({ commentText: '수정댓글' });
        expect(res.status).toEqual(200);
    });
    test('댓글 수정(실패)', async () => {
        const res = await superTest(app)
            .post('/api/posts/1/comment/1')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toEqual(400);
        expect(res.body.message).toEqual('댓글을 입력해주세요');
    });
    test('댓글 삭제', async () => {
        const res = await superTest(app)
            .delete('/api/posts/1/comment/1')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toEqual(200);
    });
    test('게시글 좋아요', async () => {
        const res = await superTest(app)
            .get('/api/posts/1/like')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toEqual(200);
        expect(res.body.message).toEqual('좋아요 성공');
    });
    test('게시글 좋아요 취소', async () => {
        const res = await superTest(app)
            .get('/api/posts/1/like')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toEqual(200);
        expect(res.body.message).toEqual('좋아요 삭제');
    });
    test('게시글 삭제', async () => {
        const res = await superTest(app)
            .delete('/api/posts/1')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toEqual(200);
        expect(res.body.message).toEqual('게시글 삭제 성공');
    });
});

// afterAll(async () => {
//     sequelize.drop();
//     console.log('All tables droped.');
// });
