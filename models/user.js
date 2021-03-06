'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            User.hasMany(models.Post, {
                sourceKey: 'userId',
                foreignKey: 'userId',
                onDelete: 'cadcade',
            });
            User.hasMany(models.Comment, {
                sourceKey: 'userId',
                foreignKey: 'userId',
                onDelete: 'cadcade',
            });
            User.hasMany(models.LikePost, {
                sourceKey: 'userId',
                foreignKey: 'userId',
                onDelete: 'cadcade',
            });
        }
    }
    User.init(
        {
            id: {
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            nickname: DataTypes.STRING,
            password: DataTypes.STRING,
            userId: {
                unique: true,
                type: DataTypes.STRING,
            },
        },
        {
            sequelize,
            modelName: 'User',
        }
    );
    return User;
};
