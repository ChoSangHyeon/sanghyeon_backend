'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('LikePosts', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            likeUserId: {
                type: Sequelize.STRING,
            },
            likePostId: {
                type: Sequelize.STRING,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('LikePosts');
    },
};
