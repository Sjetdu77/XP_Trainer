const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('pokebase', 'swider', 'daSwid77130', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'pokebase.sqlite'
});

module.exports = {
    dataBaseTable: sequelize
};