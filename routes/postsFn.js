const { Post, LikePost, Comment } = require('../models');
const { DateTime } = require('luxon');

//게시글 조회
exports.getPosts = async (req, res) => {
    const isLike = {};
    try {
        const userId = res.locals.user;

        const post = await Post.findAll({
            order: [['date', 'DESC']],
        });
        // const post2 = await Post.findAll({
        //     include: [
        //         {
        //             model: User,
        //             require: false,
        //             attributes: ['userId', 'nickname'],
        //         },
        //         {
        //             model: LikePost,
        //             required: false,
        //             attributes: ['userId', 'postId'],
        //         },
        //     ],
        //     order: [['date', 'DESC']],
        // });
        // const post3 = post2.map((hi) => {
        //     console.log(hi['User']['userId']);
        //     return hi;
        // });

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
                writer: temp.userId,
                postId: temp.postId,
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
};

//게시글 작성
exports.postPosts = async (req, res) => {
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
};

//지정 게시글조회
exports.selectPost = async (req, res) => {
    try {
        const userId = res.locals.user;

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
};

//게시글 삭제
exports.deletePost = async (req, res) => {
    try {
        const { userId } = res.locals.user;
        const { postId } = req.params;

        const existPost = await Post.findOne({
            where: { postId },
        });

        if (existPost.userId === userId && existPost) {
            await Comment.destroy({ where: { postId } });
            await LikePost.destroy({ where: { postId } });
            await existPost.destroy();
        }
        res.send({ message: '게시글 삭제 성공' });
    } catch (err) {
        console.log(err);
        res.status(400).send({ message: '게시글 삭제 실패' });
    }
};

//게시글 수정
exports.modifyPost = async (req, res) => {
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
};

//댓글 조회
exports.getComment = async (req, res) => {
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
};

//댓글 작성
exports.postComment = async (req, res) => {
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
};

//댓글 수정
exports.modifyCommnet = async (req, res) => {
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
};

//댓글 삭제
exports.deleteCommnet = async (req, res) => {
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
};

//게시물 좋아요
exports.likePost = async (req, res) => {
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
};
