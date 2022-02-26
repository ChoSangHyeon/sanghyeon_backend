const express = require('express');
// const { Op } = require('sequelize');

const cors = require('cors');
const Http = require('http');
const app = express();
const http = Http.createServer(app);

const router = express.Router();

app.use(express.json());
app.use(cors());
app.use('/api', express.urlencoded({ extended: false }), router);

const postRouter = require('./routes/posts.js');
const usersRouter = require('./routes/users.js');

app.use('/api', [postRouter, usersRouter]);

app.get('/', (req, res) => {
    res.send('this is root page');
});

module.exports = http;

// http.listen(3000, () => {
//     console.log('서버가 켜졌어요!');
// });

// const SocketIo = require('socket.io');
// const io = SocketIo(http);
// io.on('connection', (Socket) => {
//     console.log('a user connected');
//     Socket.on('Like', (data) => {
//         const payload = {
//             nickname: data.nickname,
//             userId: data.userId,
//             postId: data.postId,
//             date: DateTime.now().setZone('Asia/seoul').toISO(),
//         };
//         Post.findOne({ where: { postId: data.postId } }).then((post) => {
//             io.to(`${post.userId}`).emit('Like_Post', payload);
//         });
//     });
//     Socket.on('Comment', (data) => {
//         const payload = {
//             nickname: data.nickname,
//             userId: data.userId,
//             postId: data.postId,
//             date: DateTime.now().setZone('Asia/seoul').toISO(),
//         };
//         Post.findOne({ where: { postId: data.postId } }).then((post) => {
//             io.to(`${post.userId}`).emit('Comment_Post', payload);
//         });
//     });
//     Socket.on('disconnect', () => {
//         console.log('연결이 끊겼습니다.');
//     });
// });
