const Joi = require('joi');
const crypto = require('crypto');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

//회원가입 규정
const postUsersSchema = Joi.object({
    nickname: Joi.string().min(3).alphanum().required(),
    userId: Joi.string().email().required(),
    password: Joi.string().min(4).required(),
    passwordCheck: Joi.string().required(),
});

//회원가입
exports.signup = async (req, res) => {
    console.log(req.body);
    try {
        const { nickname, userId, password, passwordCheck } =
            await postUsersSchema.validateAsync(req.body);

        if (password !== passwordCheck) {
            res.status(400).send({
                errorMessage: '패스워드가 패스워드 확인란과 동일하지 않습니다.',
            });
            return;
        }
        const existUsers = await User.findAll({
            where: {
                [Op.or]: [{ userId }, { nickname }],
            },
        });
        if (existUsers.length) {
            res.status(400).send({
                errorMessage: '이미 가입된 이메일 또는 닉네임이 있습니다.',
            });
            return;
        }
        const crypassword = crypto
            .pbkdf2Sync(password, userId, 1, 32, 'sha512')
            .toString('base64');

        await User.create({ userId, nickname, password: crypassword });
        res.status(201).send({ message: '회원가입 성공' });
    } catch (err) {
        console.log(err);
        res.status(400).send({
            errorMessage: '요청한 데이터 형식이 올바르지 않습니다.',
        });
    }
};

//로그인 규정
const postAuthSchema = Joi.object({
    userId: Joi.string().required(),
    password: Joi.string().required(),
});

//로그인
exports.signin = async (req, res) => {
    try {
        const { userId, password } = await postAuthSchema.validateAsync(
            req.body
        );

        const user = await User.findOne({ where: { userId } });
        if (!user) {
            res.status(400).send({
                errorMessage: '이메일 또는 패스워드가 잘못됐습니다.',
            });
            return;
        }
        const checkpassword = crypto
            .pbkdf2Sync(password, userId, 1, 32, 'sha512')
            .toString('base64');
        if (checkpassword !== user.password) {
            res.status(400).send({
                errorMessage: '이메일 또는 패스워드가 잘못됐습니다.',
            });
            return;
        }

        const token = jwt.sign({ userId: user.userId }, 'my-secret-key');
        res.send({ token, message: '로그인 성공' });
    } catch (err) {
        console.log(err);
        res.status(400).send({ Message: '로그인 실패.' });
    }
};

//로그인 인증
exports.me = async (req, res) => {
    try {
        res.send({ user: res.locals.user, message: '사용자인증완료' });
    } catch (err) {
        res.status(400).send({ message: '사용자인증 실패' });
    }
};
