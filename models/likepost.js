'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LikePost extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  LikePost.init({
    likeUserId: DataTypes.STRING,
    likePostId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'LikePost',
  });
  return LikePost;
};