const postController = require('../../routes/postsFn');
const userController = require('../../routes/usersFn');
const { Post, LikePost, Comment, User } = require('../../models');
const httpMocks = require('node-mocks-http');
const newUser = require('../data/user.json');
const newPost = require('../data/post.json');
const auth_middleware = require('../../middlewares/auth_middleware');
const readAuth_middleware = require('../../middlewares/readAuth_middleware');

User.findOne = jest.fn();
Post.findAll = jest.fn();
LikePost.findAll = jest.fn();
let req, res, next;
beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
});

describe('auth_middleware Test', () => {
    test('정상적인 토큰 주입시 user.findone 실행', async () => {
        User.findOne = jest.fn();
        auth_middleware(
            {
                headers: {
                    authorization:
                        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJ1c2VySWQiOjk5fQ.-YBvHRUwiSXHs4ajx9jUVcbOgJhmEPBgeqXptDMjGK0',
                },
            },
            res
        );
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({ where: { userId: 99 } });
    });
    test('변조된 토큰으로 요청한 경우 로그인 후 사용하세요 라는 에러 메세지가 뜬다.', () => {
        const mockedSend = jest.fn();
        auth_middleware(
            {
                headers: {
                    authorization: 'Bearer aa',
                },
            },
            {
                status: () => ({
                    send: mockedSend,
                }),
                locals: {},
            }
        );
        expect(mockedSend).toHaveBeenCalledWith({
            errorMessage: '로그인 후 이용 가능한 기능입니다.',
        });
    });
    test('토큰이없이 요청한 경우 로그인 후 사용하세요 라는 에러 메세지가 뜬다.', () => {
        const mockedSend = jest.fn();
        auth_middleware(req, {
            status: () => ({
                send: mockedSend,
            }),
            locals: {},
        });

        expect(mockedSend).toHaveBeenCalledWith({
            errorMessage: '로그인 후 이용 가능한 기능입니다.',
        });
    });
});

describe('readAuth_middlware Test', () => {
    test('정상적인 토큰 주입시 읽기용 인증에서 user.findone 실행', async () => {
        User.findOne = jest.fn();
        readAuth_middleware(
            {
                headers: {
                    authorization:
                        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJ1c2VySWQiOjk5fQ.-YBvHRUwiSXHs4ajx9jUVcbOgJhmEPBgeqXptDMjGK0',
                },
            },
            res,
            jest.fn()
        );
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({ where: { userId: 99 } });
    });
    test('변조된 토큰으로 읽기용 인증에 요청한 local.user가 null이 되어야한다.', () => {
        const mockedSend = jest.fn();

        readAuth_middleware(
            {
                headers: {
                    authorization: 'Bearer aa',
                },
            },
            {
                status: () => ({
                    send: () => {},
                }),
                locals: mockedSend,
            },
            jest.fn()
        );

        expect(mockedSend.user).toEqual(null);
    });
});

describe('getPosts Test', () => {
    beforeEach(() => {
        req.body = newPost;
    });
    test('모델불러오기', async () => {
        Post.findAll.mockReturnValue([newPost]);
        LikePost.findAll.mockReturnValue({});
        await postController.getPosts(req, res);
        expect(res.statusCode).toEqual(200);
        expect(res._isEndCalled).toBeTruthy();
    });
    test('목차불러오기', async () => {
        Post.findAll.mockReturnValue([
            {
                userId: 'test',
                postId: 'test',
                imagePath:
                    'https://w.namu.la/s/96f05e961ab1169f6f0ef41902388df4832baabd91f44e79ad4b83a2eb53439831f02378ce10fe4073f627f25ac31fcfe3de93161fc5d171902c77b9159aa9178d7e546c91f9dd9c6a9d7e2e70009cac1a7bc74a6c14dda82e9618e3f4fc110cb305848dc8518df8173f38887101fa7d',
                desc: '사과2',
            },
        ]);
        LikePost.findAll.mockReturnValue([]);
        await postController.getPosts(req, res);
        expect(res._getData()['posts']).toStrictEqual([newPost]);
    });
    test('목차불러오기 실패', async () => {
        Post.findAll.mockReturnValue();
        LikePost.findAll.mockReturnValue({});
        await postController.getPosts(req, res);
        expect(res.statusCode).toEqual(400);
    });
});

describe('postPosts Test',()=>{
    
})