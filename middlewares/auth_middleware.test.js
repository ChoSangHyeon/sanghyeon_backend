const auth_middleware = require('./auth_middleware');

jest.mock('../models');

const { User } = require('../models');

test('정상적인 토큰 주입시 user.findone 실행', async () => {
    User.findOne = jest.fn();
    auth_middleware(
        {
            headers: {
                authorization:
                    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJ1c2VySWQiOjk5fQ.-YBvHRUwiSXHs4ajx9jUVcbOgJhmEPBgeqXptDMjGK0',
            },
        },
        {
            status: () => ({
                send: () => {},
            }),
            locals: {},
        }
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
