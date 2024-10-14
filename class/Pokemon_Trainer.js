const { DataTypes, Model } = require('sequelize');
const { dataBaseTable } = require('../datas/table_models.js');

class Pokemon_Trainer extends Model {
    getDatasFromTrainer() {
        return {
            getLuckyEgg: this.getLuckyEgg,
            getExpCharm: this.getExpCharm
        }
    }
}

Pokemon_Trainer.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: DataTypes.STRING,
    userId: DataTypes.STRING,
    getLuckyEgg: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    getExpCharm: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize: dataBaseTable,
    modelName: 'trainer',
    timestamps: false
});

module.exports = Pokemon_Trainer;