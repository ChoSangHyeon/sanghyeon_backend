const express = require('express');
const { Op } = require('sequelize');
const Joi = require('joi');
const { User, Post, LikePost, Comment } = require('./models');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middlewares/auth_middleware');
const Http = require('http');
const SocketIo = require('socket.io');
const { DateTime } = require('luxon');
const cors = require('cors');
const readAuth_middleware = require('./middlewares/readAuth_middleware');
const crypto = require('crypto');

const app = express();
const http = Http.createServer(app);
const io = SocketIo(http);
const router = express.Router();

async function islike(postid, userId) {
    if (!userId) {
        return false;
    }
    const result = (await LikePost.findOne({
        where: { likePostId: postid, likeUserId: userId },
    }))
        ? true
        : false;
    return result;
}
io.on('connection', (Socket) => {
    console.log('a user connected');

    Socket.on('Like', (data) => {
        const payload = {
            nickname: data.nickname,
            userId: data.userId,
            postId: data.postId,
            date: DateTime.now().setZone('Asia/seoul').toISO(),
        };
        io.to().emit('Like_Post', payload);
        // Socket.broadcast.emit("BUY_GOODS",payload);
    });
    Socket.on('disconnect', () => {
        console.log('연결이 끊겼습니다.');
    });
});

const postUsersSchema = Joi.object({
    nickname: Joi.string().min(3).alphanum().required(),
    userId: Joi.string().email().required(),
    password: Joi.string().min(4).required(),
    passwordCheck: Joi.string().required(),
});

router.post('/users/signup', async (req, res) => {
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
});

const postAuthSchema = Joi.object({
    userId: Joi.string().required(),
    password: Joi.string().required(),
});

router.post('/users/signin', async (req, res) => {
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
});

router.get('/users/me', authMiddleware, async (req, res) => {
    res.send({ user: res.locals.user });
});

const likeCnt = {};
router.get('/posts', readAuth_middleware, async (req, res) => {
    try {
        let userId = null;
        if (res.locals.user) {
            userId = res.locals.user;
        }
        const post = await Post.findAll({
            order: [['date', 'DESC']],
        });
        const postId = post.map((temp) => temp.postId);

        for (const ID of postId) {
            likeCnt[ID] = await LikePost.count({
                where: { likePostId: ID },
            });
        }
        res.send({
            posts: post.map((temp) => ({
                writer: temp.postId,
                userId: temp.userId,
                images: temp.imagePath,
                desc: temp.desc,
                likeCount: likeCnt[temp.postId],
                isLiked: islike(temp.postId, userId),
            })),
        });
    } catch (err) {
        console.log(err);
        res.status(400).send({ message: '게시글 목록 조회 실패' });
    }
});

router.post('/posts', authMiddleware, async (req, res) => {
    try {
        const { userId } = res.locals.user;
        const { images, desc } = req.body;
        if (!desc) {
            res.status(400).send({
                message: '본문을 입력해주세요',
            });
            return;
        }

        await Post.create({
            imagePath: images,
            desc,
            date: DateTime.now().setZone('Asia/seoul').toISO(),
            userId,
        });
        res.status(200).send({ message: '게시글 추가 성공' });
    } catch (err) {
        console.log(err);
        res.status(400).send({ message: '게시글 추가 실패' });
    }
});

router.get('/posts/:postId', readAuth_middleware, async (req, res) => {
    try {
        let userId = null;
        if (res.locals.user) {
            userId = res.locals.user;
        }
        const { postId } = req.params;
        const post = await Post.findOne({
            where: { postId },
        });
        const tempPost = await LikePost.count({
            where: { likePostId: postId },
        });
        const youLikePost = await islike(postId, userId);
        const Posts = {
            writer: post.userId,
            date: post.date,
            images: post.imagePath,
            desc: post.desc,
            likeCount: tempPost,
            isLiked: youLikePost,
        };
        res.send({ Posts, message: '게시글 조회 성공' });
    } catch (err) {
        console.log(err);
        res.status(400).send({ message: '게시글 조회 실패' });
    }
});

router.delete('/posts/:postId', authMiddleware, async (req, res) => {
    try {
        const { userId } = res.locals.user;
        const { postId } = req.params;

        const existPost = await Post.findOne({
            where: { postId },
        });

        const existComment = await Comment.findAll({
            where: { postId },
        });

        const existLike = await LikePost.findAll({
            where: { likePostId: postId },
        });

        if (existPost.userId === userId && existsPost) {
            await existPost.destroy();
            await existComment.destroy();
            await existLike.destroy();
        }
        res.send({ message: '게시글 삭제 성공' });
    } catch (err) {
        console.log(err);
        res.status(400).send({ message: '게시글 삭제 실패' });
    }
});

router.put('/posts/:postId', authMiddleware, async (req, res) => {
    try {
        const { userId } = res.locals.user;
        const { postId } = req.params;
        const { images, desc } = req.body;
        if (!desc) {
            res.status(400).send({
                message: '본문을 입력해주세요',
            });
            return;
        }
        const existpost = await Post.findOne({ where: { userId, postId } });
        if (existpost) {
            existpost.imagesPath = images;
            existpost.desc = desc;
            await existpost.save();
        } else {
            await Post.create({
                images,
                desc,
                date: DateTime.now().setZone('Asia/seoul').toISO(),
                userId,
            });
        }
        res.send({ message: '게시글 수정 성공' });
    } catch (err) {
        res.status(400).send({ message: '게시글 수정 실패' });
    }
});

router.get('/posts/:postId/comments', async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await Comment.findAll({
            where: { postId },
        });
        res.send({ comments, message: '댓글 조회 성공' });
    } catch (err) {
        console.log(err);
        res.status(400).send({ message: '댓글 조회 실패' });
    }
});

router.post('/posts/:postId/comment', authMiddleware, async (req, res) => {
    try {
        const { userId } = res.locals.user;
        const { postId } = req.params;
        const { commentText } = req.body;
        if (!commentText) {
            res.status(400).send({
                message: '댓글을 입력해주세요',
            });
            return;
        }
        await Comment.create({
            commentText,
            date: DateTime.now().setZone('Asia/seoul').toISO(),
            userId,
            postId,
        });
        res.status(200).send({ message: '댓글 추가 성공' });
    } catch (err) {
        console.log(err);
        res.status(400).send({ message: '댓글 추가 실패' });
    }
});

router.put(
    '/posts/:postId/comment/:commentId',
    authMiddleware,
    async (req, res) => {
        try {
            const { userId } = res.locals.user;
            const { postId, commentId } = req.params;
            const { commentText } = req.body;
            if (!commentText) {
                res.status(400).send({
                    message: '댓글을 입력해주세요',
                });
                return;
            }
            const existComment = await Comment.findOne({
                where: { userId, postId, commentId },
            });
            if (existComment) {
                existComment.commentText = commentText;
                await existComment.save();
            } else {
                await Comment.create({
                    commentText,
                    date: DateTime.now().setZone('Asia/seoul').toISO(),
                    userId,
                    postId,
                });
            }
            res.send({ message: '댓글 수정 성공' });
        } catch (err) {
            console.log(err);
            res.status(400).send({ message: '댓글 수정 실패' });
        }
    }
);

router.delete(
    '/posts/:postId/comment/:commentId',
    authMiddleware,
    async (req, res) => {
        try {
            const { userId } = res.locals.user;
            const { postId, commentId } = req.params;
            const existComment = await Comment.findOne({
                where: { commentId },
            });
            if (existComment.userId === userId && existComment) {
                existComment.destroy();
            }
            res.send({ message: '댓글 삭제 성공' });
        } catch (err) {
            console.log(err);
            res.status(400).send({ message: '댓글 삭제 실패' });
        }
    }
);

router.get('/posts/:postId/like', authMiddleware, async (req, res) => {
    const { userId } = res.locals.user;
    const { postId } = req.params;
    const existLike = await LikePost.findOne({
        where: { likeUserId: userId, likePostId: postId },
    });
    if (existLike) {
        existLike.destroy();
        res.send({ message: '좋아요 삭제' });
    } else {
        await LikePost.create({ likeUserId: userId, likePostId: postId });
        res.send({ message: '좋아요 성공' });
    }
});
app.use(express.json());
app.use(cors());
app.use('/api', express.urlencoded({ extended: false }), router);

http.listen(8080, () => {
    console.log('서버가 켜졌어요!');
});
