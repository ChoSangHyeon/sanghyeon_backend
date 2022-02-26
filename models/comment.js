'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Comment extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Comment.belongsTo(models.Post, {
                foreignKey: 'postId',
                targetKey: 'userId',
            });
            Comment.belongsTo(models.User, {
                foreignKey: 'userId',
                targetKey: 'userId',
            });
        }
    }
    Comment.init(
        {
            commentId: {
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            postId: DataTypes.STRING,
            userId: DataTypes.STRING,
            commentText: DataTypes.STRING,
            date: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: 'Comment',
            charset: 'utf8mb4',
            collate: 'utf8_generak_Ci',
        }
    );
    return Comment;
};
