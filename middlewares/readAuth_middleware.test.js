const readAuth_middleware = require('./readAuth_middleware');

jest.mock('../models');

const { User } = require('../models');

test('정상적인 토큰 주입시 읽기용 인증에서 user.findone 실행', async () => {
    User.findOne = jest.fn();
    readAuth_middleware(
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
        },
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
