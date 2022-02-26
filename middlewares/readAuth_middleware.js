const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = (req, res, next) => {
    const { authorization } = req.headers;
    const [authType, authToken] = (authorization || '').split(' ');
    if (!authToken || authType !== 'Bearer') {
        res.locals.user = null;
        next();
        return;
    }

    try {
        const { userId } = jwt.verify(authToken, 'my-secret-key');
        User.findOne({ where: { userId: userId } }).then((user) => {
            res.locals.user = user;
            next();
        });
    } catch (err) {
        res.locals.user = null;
        next();
    }
};
