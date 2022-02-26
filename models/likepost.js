'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class LikePost extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            LikePost.belongsTo(models.User, {
                foreignKey: 'userId',
                targetKey: 'userId',
            });
            LikePost.belongsTo(models.Post, {
                foreignKey: 'postId',
                targetKey: 'postId',
            });
        }
    }
    LikePost.init(
        {
            userId: DataTypes.STRING,
            postId: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: 'LikePost',
        }
    );
    return LikePost;
};
