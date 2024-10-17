const { DataTypes, Model } = require('sequelize');
const { dataBaseTable } = require('../datas/table_models.js');
const Pokemon_Creature = require('./Pokemon_Creature.js');
const Specie_Evolution = require('./Specie_Evolution.js');

var origin = {
    'A': "d'Alola",
    'G': "de Galar",
    'H': "de Hisui",
    'P': "de Paldea"
}

class Pokemon_Specie extends Model {
    getSpecieName() {
        const [_, o] = this.id.split('-');
        return `${this.name}${o ? ` ${origin[o]}` : ''}`;
    }

    /**
     * 
     * @param {number} level 
     * @returns 
     */
    calculateLvlXP(level) {
        let xpMax = level**3;

        switch (this.CURB_XP) {
            case 'Rapide': xpMax *= 0.8; break;
            case 'Parabolique':
                xpMax = 1.2 * xpMax - 15 * level**2 + 100 * level - 140;
                break;

            case 'Lente': xpMax *= 1.25; break;
            case 'Erratique':
                if (level <= 50) xpMax = (xpMax * (100 - level)) / 50;
                else if (level <= 68) xpMax = (xpMax * (150 - level)) / 100;
                else if (level > 98) xpMax = (xpMax * (160 - level)) / 100;
                else xpMax = (xpMax * ((1911 - 10 * level) / 3)) / 100;
                break;

            case 'Fluctuante':
                if (level <= 15) xpMax *= (24 + (level + 1) / 3) / 50;
                else if (level <= 35) xpMax *= (14 + level) / 50;
                else xpMax *= (32 + level / 2) / 50;
                break;
        }

        return xpMax;
    }

    /**
     * 
     * @returns {Specie_Evolution[]}
     */
    getEvolutions() {
        let evolutions = [];
        for (const evolution of this.evolutions) evolutions.push(evolution.specie_evolution);
        return evolutions;
    }

    /**
     * 
     * @param {Pokemon_Creature} creature 
     * @returns 
     */
    getGoodEvolutions(creature) {
        const evolutions = this.getEvolutions();
        let goodEvolutions = [];
        for (const evolution of evolutions) {
            const conditions = evolution.conditions;
            if (conditions === '' || (conditions === 'F' && creature.happiness >= 160)
                    || (conditions.startsWith('L.') && creature.level >= parseInt(conditions.slice(2))))
            goodEvolutions.push(evolution);
        }

        return goodEvolutions;
    }

    /**
     * 
     * @param {Pokemon_Creature} creature 
     * @returns 
     */
    canEvolute = (creature) => this.getGoodEvolutions(creature).length > 0;
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
    },
    happinessBase: {
        type: DataTypes.INTEGER,
        defaultValue: 50
    }
}, {
    sequelize: dataBaseTable,
    modelName: 'specie',
    timestamps: false
});

module.exports = Pokemon_Specie;