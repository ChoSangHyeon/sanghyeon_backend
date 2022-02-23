const { Post, LikePost, Comment } = require('../models');
const express = require('express');
// const { Op } = require('sequelize');
const authMiddleware = require('../middlewares/auth_middleware');
const readAuth_middleware = require('../middlewares/readAuth_middleware');
const { DateTime } = require('luxon');
const router = express.Router();

//게시글 조회
const isLike = {};
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
            isLike[ID] = await LikePost.findAll({
                where: { postId: ID },
                // attributes: ['userId'],
            });
        }
        const tempPost = post.map(async (temp) => {
            let likefake = false;
            if (userId) {
                for (const check of isLike[temp.postId]) {
                    {
                        if (userId.userId === check.dataValues.userId) {
                            likefake = true;
                        }
                    }
                }
            }
            return {
                writer: temp.postId,
                userId: temp.userId,
                images: temp.imagePath,
                desc: temp.desc,
                likeCount: isLike[temp.postId].length,
                isLiked: likefake,
            };
        });
        const result = await Promise.all(tempPost);
        res.send({
            posts: result,
        });
    } catch (err) {
        console.log(err);
        res.status(400).send({ message: '게시글 목록 조회 실패' });
    }
});

//게시글 작성
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

//지정 게시글조회
router.get('/posts/:postId', readAuth_middleware, async (req, res) => {
    try {
        let userId = null;
        if (res.locals.user) {
            userId = res.locals.user;
        }
        const { postId } = req.params;
        const posts = await Post.findOne({
            where: { postId },
        });
        const tempPost = await LikePost.findAll({
            where: { postId },
            // attributes: ['userId'],
        });
        let likefake = false;
        if (userId) {
            for (const check of tempPost) {
                if (userId.userId === check.dataValues.userId) {
                    likefake = true;
                    break;
                }
            }
        }

        const alreadyPost = {
            writer: posts.userId,
            date: posts.date,
            images: posts.imagePath,
            desc: posts.desc,
            likeCount: tempPost.length,
            isLiked: likefake,
        };
        res.send({ Post: alreadyPost, message: '게시글 조회 성공' });
    } catch (err) {
        console.log(err);
        res.status(400).send({ message: '게시글 조회 실패' });
    }
});

//게시글 삭제
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
            where: { postId },
        });

        if (existPost.userId === userId && existPost) {
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

//게시글 수정
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

//지정게시글 댓글 조회
router.get('/posts/:postId/comments', async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await Comment.findAll({
            where: { postId },
            // attributes: [
            //     'userId',
            //     'date',
            //     'postId',
            //     'commentText',
            //     'commentId',
            // ],
        });
        res.send({ comments, message: '댓글 조회 성공' });
    } catch (err) {
        console.log(err);
        res.status(400).send({ message: '댓글 조회 실패' });
    }
});

//댓글 작성
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

//댓글 수정
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

//댓글 삭제
router.delete(
    '/posts/:postId/comment/:commentId',
    authMiddleware,
    async (req, res) => {
        try {
            const { userId } = res.locals.user;
            const { commentId } = req.params;
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

//좋아요
router.get('/posts/:postId/like', authMiddleware, async (req, res) => {
    const { userId } = res.locals.user;
    const { postId } = req.params;
    const existLike = await LikePost.findOne({
        where: { userId, postId },
    });
    if (existLike) {
        existLike.destroy();
        res.send({ message: '좋아요 삭제' });
    } else {
        await LikePost.create({ userId, postId });
        res.send({ message: '좋아요 성공' });
    }
});

module.exports = router;
