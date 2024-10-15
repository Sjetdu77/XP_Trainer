const { DataTypes, Model } = require('sequelize');
const { dataBaseTable } = require('../datas/table_models.js');
const Pokemon_Specie = require('./Pokemon_Specie.js');

class Pokemon_Creature extends Model {
    async getSpecieName() {
        const specie = await this.getSpecie();
        return specie.getSpecieName();
    }

    /**
     * 
     * @param {Pokemon_Creature} foe 
     * @param {boolean} participate 
     * @returns 
     */
    async gainXPViaFoe(foe, participate = false) {
        const trainer = await this.getTrainer();
        const foesSpecie = await foe.getSpecie();
        const trainerDatas = await trainer.getDatasFromTrainer();

        let firstPart = foesSpecie.baseXP * foe.level / 5;
        if (!participate) firstPart /= 2;
        
        let experience = firstPart * ((2 * foe.level + 10) / (foe.level + this.level + 10))**2.5 + 1;
        if (this.exchanged) experience *= 1.5;
        if (trainerDatas.getLuckyEgg) experience *= 1.5;
        if (await this.canEvolute()) experience *= 1.5;
        if (this.happiness >= 200) experience *= 1.2;

        experience = Math.round(experience);

        const lvlGained = await this.gainXP(experience, true);

        return [experience, lvlGained];
    }

    /**
     * 
     * @param {number} exp 
     * @returns 
     */
    async gainXP(exp, battle = false) {
        if (!this.actualXP) this.actualXP = 0;
        this.actualXP += exp;
        let numLevelUp = 0, maxXP = await this.getMaxXP();

        while (this.actualXP >= maxXP) {
            numLevelUp++;
            this.level++;

            this.changeHappiness([3, 2, 0, 0]);
            if (battle) this.changeHappiness([3, 2, 0, 0]);
            
            maxXP = await this.getMaxXP();
        }

        this.actualXP = Math.floor(this.actualXP);

        this.save();
        return numLevelUp;
    }

    /**
     * 
     * @param {number} exp 
     * @returns 
     */
    async minusXP(exp) {
        let lvlLost = 0
        this.actualXP -= exp;
        while (this.actualXP < await this.getMinXP()) {
            this.level--;
            lvlLost++;
        }

        this.save();
        return lvlLost;
    }

    /**
     * 
     * @param {Pokemon_Creature} foe 
     * @returns 
     */
    async minusXPViaFoe(foe) {
        const trainer = await this.getTrainer();
        const foesSpecie = await foe.getSpecie();
        const trainerDatas = await trainer.getDatasFromTrainer();
        
        let experience1 = ((foesSpecie.baseXP * foe.level / 5)
                * ((2 * foe.level + 10) / (foe.level + this.level + 10))**2.5 + 1);
        let experience2 = ((foesSpecie.baseXP * foe.level / 10)
                * ((2 * foe.level + 10) / (foe.level + this.level + 10))**2.5 + 1);
        
        if (this.exchanged) {
            experience1 *= 1.5;
            experience2 *= 1.5;
        }
        if (trainerDatas.getLuckyEgg) {
            experience1 *= 1.5;
            experience2 *= 1.5;
        }
        if (await this.canEvolute()) {
            experience1 *= 1.5;
            experience2 *= 1.5;
        }
        if (this.happiness >= 200) {
            experience1 *= 1.2;
            experience2 *= 1.2;
        }

        experience1 = Math.round(experience1);
        experience2 = Math.round(experience2);

        let total = experience1 - experience2;

        const lvlLost = await this.minusXP(total);
        return [total, lvlLost];
    }

    /**
     * 
     * @param {number} lvl 
     * @returns 
     */
    async gainLevels(lvl) {
        for (let l = 0 ; l < lvl ; l++) {
            this.level++;
            if (this.happiness < 100) this.happiness += 3;    
            else if (this.happiness < 160) this.happiness += 2;
        }

        this.actualXP = await this.getMinXP();

        this.save();
        return lvl;
    }

    /**
     * 
     * @returns {Promise<number>}
     */
    async getMinXP() {
        const specie = await this.getSpecie();
        return specie.calculateLvlXP(this.level - 1);
    }

    async setMinXP() {
        this.actualXP = await this.getMinXP();
        this.save();
    }

    /**
     * 
     * @returns {Promise<number>}
     */
    async getMaxXP() {
        const specie = await this.getSpecie();
        return specie.calculateLvlXP(this.level);
    }

    getXPRate = async () =>
        (this.actualXP - await this.getMinXP()) / (await this.getMaxXP() - await this.getMinXP());

    /**
     * 
     * @returns {Promise<boolean>}
     */
    async canEvolute() {
        const specie = await this.getSpecie({ include: [Pokemon_Specie.Evolution] });
        return specie.canEvolute(this);
    }

    /**
     * 
     * @returns {Promise<Specie_Evolution[]>}
     */
    async getEvolutions() {
        const specie = await this.getSpecie({ include: [Pokemon_Specie.Evolution] });
        return specie.getEvolutions(this);
    }

    /**
     * 
     * @returns {Promise<Specie_Evolution[]>}
     */
    async getGoodEvolutions() {
        const specie = await this.getSpecie({ include: [Pokemon_Specie.Evolution] });
        return specie.getGoodEvolutions(this);
    }

    /**
     * 
     * @param {Specie_Evolution} specie 
     */
    async evolution(specie) {
        this.specieId = specie.evolutionId;
        this.save();
        return await Pokemon_Specie.findOne({ where: { id: specie.evolutionId } });
    }

    /**
     * 
     * @param {number[]} hPoints 
     * @returns {number}
     */
    changeHappiness(hPoints) {
        if (hPoints.length < 4) return -1;
        
        if (this.happiness < 100) this.happiness += hPoints[0];
        else if (this.happiness < 160) this.happiness += hPoints[1];
        else if (this.happiness < 180) this.happiness += hPoints[2];
        else this.happiness += hPoints[3];
        this.save();
        return this.happiness;
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
        defaultValue: 50
    },
    place: {
        type: DataTypes.STRING,
        defaultValue: 'wild'
    }
}, {
    sequelize: dataBaseTable,
    modelName: 'creature',
    timestamps: false
});

module.exports = Pokemon_Creature;