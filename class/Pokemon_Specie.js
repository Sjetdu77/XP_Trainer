const { DataTypes, Model } = require('sequelize');
const { dataBaseTable } = require('./table_models.js');

class Pokemon_Specie extends Model {
    calculateLvlXP(level) {
        let xpMax = level**3;

        switch (this.CURB_XP) {
            case 'Rapide':
                xpMax *= 0.8;
                break;

            case 'Parabolique':
                xpMax = 1.2 * xpMax - 15 * level**2 + 100 * level - 140;
                break;

            case 'Lente':
                xpMax *= 1.25;
                break;

            case 'Erratique':
                if (level <= 50) {
                    xpMax = (xpMax * (100 - level)) / 50;
                } else if (level <= 68) {
                    xpMax = (xpMax * (150 - level)) / 100;
                } else if (level > 98) {
                    xpMax = (xpMax * (160 - level)) / 100;
                } else {
                    xpMax = (xpMax * ((1911 - 10 * level) / 3)) / 100;
                }
                break;

            case 'Fluctuante':
                if (level <= 15) {
                    xpMax *= (24 + (level + 1) / 3) / 50;
                } else if (level <= 35) {
                    xpMax *= (14 + level) / 50;
                } else {
                    xpMax *= (32 + level / 2) / 50;
                }
                break;
        }

        return xpMax;
    }
}

Pokemon_Specie.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    english_name: DataTypes.STRING,
    name: DataTypes.STRING,
    baseXP: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    curbXP: {
        type: DataTypes.STRING,
        allowNull: true
    },
    starter: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize: dataBaseTable,
    modelName: 'specie',
    timestamps: false
});


module.exports = {
    Pokemon_Specie
}