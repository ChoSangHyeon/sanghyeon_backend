const express = require('express');
const authMiddleware = require('../middlewares/auth_middleware');
const readAuth_middleware = require('../middlewares/readAuth_middleware');
const router = express.Router();
const postsController = require('./postsFn');

//게시글 조회
router.get('/', readAuth_middleware, postsController.getPosts);

//게시글 작성
router.post('/', authMiddleware, postsController.postPosts);

//지정 게시글조회
router.get('/:postId', readAuth_middleware, postsController.selectPost);

//게시글 삭제
router.delete('/:postId', authMiddleware, postsController.deletePost);

//게시글 수정
router.put('/:postId', authMiddleware, postsController.modifyPost);

//지정게시글 댓글 조회
router.get('/:postId/comments', postsController.getComment);

//댓글 작성
router.post('/:postId/comment', authMiddleware, postsController.postComment);

//댓글 수정
router.put(
    '/:postId/comment/:commentId',
    authMiddleware,
    postsController.modifyCommnet
);

//댓글 삭제
router.delete(
    '/:postId/comment/:commentId',
    authMiddleware,
    postsController.deleteCommnet
);

//좋아요
router.get('/:postId/like', authMiddleware, postsController.likePost);

module.exports = router;
