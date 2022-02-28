const express = require('express');
const authMiddleware = require('../middlewares/auth_middleware');
const router = express.Router();
const userController = require('./usersFn');

//회원가입
router.post('/signup', userController.signup);

//로그인
router.post('/signin', userController.signin);

//로그인 검사
router.get('/me', authMiddleware, userController.me);

module.exports = router;
