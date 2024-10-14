const { DataTypes, Model } = require('sequelize');
const { dataBaseTable } = require('../datas/table_models.js');

class Specie_Evolution extends Model {}

Specie_Evolution.init({
    conditions: DataTypes.STRING,
}, {
    sequelize: dataBaseTable,
    timestamps: false,
    modelName: 'specie_evolution'
})

module.exports = Specie_Evolution;