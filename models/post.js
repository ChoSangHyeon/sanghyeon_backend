'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Post extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // Post.belongsTo(models.User, { foreignKey: 'userId' });
            // Post.hasMany(models.Comment, {
            //     onDelete: 'cadcade',
            // });
            // Post.hasMany(models.LikePost, {
            //     onDelete: 'cadcade',
            // });
        }
    }
    Post.init(
        {
            postId: {
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            userId: DataTypes.STRING,
            imagePath: DataTypes.STRING,
            desc: DataTypes.STRING,
            date: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: 'Post',
        }
    );
    return Post;
};
