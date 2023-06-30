const { Sequelize } = require('sequelize');
const dataBaseTable = new Sequelize('pokebase', 'swider', 'daSwid77130', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'pokebase.sqlite'
});

module.exports = { dataBaseTable };