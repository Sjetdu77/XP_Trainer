const { DataTypes, Model } = require('sequelize');
const { dataBaseTable } = require('./table_models.js');


class Pokemon_Creature extends Model {
    /**
     * 
     * @param {Pokemon_Creature} foe 
     * @param {boolean} participate 
     * @returns 
     */
    async gainXPViaFoe(foe, participate = false) {
        const trainer = await this.getTrainer();
        const foesDatas = await foe.getDatasForXP();
        const trainerDatas = await trainer.getDatasFromTrainer();

        let firstPart = foesDatas.specie.baseXP * foe.level / 5;
        if (!participate) firstPart /= 2;
        
        let experience = firstPart * ((2 * foe.level + 10) / (foe.level + this.level + 10))**2.5 + 1;
        if (this.exchanged) experience *= 1.5;
        if (trainerDatas.getLuckyEgg) experience *= 1.5;
        if (foesDatas.evolutions.length > 0) experience *= 1.5;
        if (this.happiness >= 200) experience *= 1.2;

        experience = Math.round(experience);

        const lvlGained = await this.gainXP(experience);

        return [experience, lvlGained];
    }

    async gainXP(exp) {
        if (!this.actualXP) {
            this.actualXP = 0;
        }
        this.actualXP += exp;
        let numLevelUp = 0, maxXP = await this.getMaxXP();

        while (this.actualXP >= maxXP) {
            numLevelUp++;
            this.level++;
            this.actualXP -= maxXP;

            if (this.happiness < 100) {
                this.happiness += 3;
            } else if (this.happiness < 160) {
                this.happiness += 2;
            }
            
            maxXP = await this.getMaxXP();
        }

        this.actualXP = Math.floor(this.actualXP);

        this.save();
        return numLevelUp;
    }

    async gainLevels(lvl) {
        this.actualXP = 0;

        for (let l = 0 ; l < lvl ; l++) {
            this.level++;
            if (this.happiness < 100) {
                this.happiness += 3;
            } else if (this.happiness < 160) {
                this.happiness += 2;
            }
        }
        this.level += lvl;

        this.save();
        return lvl;
    }

    async getMaxXP() {
        const specie = await this.getSpecie();
        return specie.calculateLvlXP(this.level);
    }

    async getDatasForXP() {
        const specie = await this.getSpecie();
        const evolutions = await specie.getEvolutions();
        return { specie, evolutions }
    }

    async getXPRate() {
        return this.actualXP / await this.getMaxXP();
    }
}

Pokemon_Creature.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nickname: {
        type: DataTypes.STRING,
        allowNull: true
    },
    level: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    actualXP: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    exchanged: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    happiness: {
        type: DataTypes.INTEGER,
        defaultValue: 70
    },
    place: {
        type: DataTypes.STRING,
        defaultValue: 'wild'
    },
    origin: DataTypes.STRING
}, {
    sequelize: dataBaseTable,
    modelName: 'creature'
});

module.exports = {
    Pokemon_Creature
}