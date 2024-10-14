const { DataTypes, Model } = require('sequelize');
const { dataBaseTable } = require('../datas/table_models.js');

var origin = {
    'A': "d'Alola",
    'G': "de Galar",
    'H': "de Hisui",
    'P': "de Paldea"
}

class Pokemon_Creature extends Model {
    async getSpecieName() {
        const specie = await this.getSpecie();
        const [_, o] = specie.id.split('-');
        return `${specie.name} ${o ? origin[o] : ''}`;
    }

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

    /**
     * 
     * @param {number} exp 
     * @returns 
     */
    async gainXP(exp) {
        if (!this.actualXP) this.actualXP = 0;
        this.actualXP += exp;
        let numLevelUp = 0, maxXP = await this.getMaxXP();

        while (this.actualXP >= maxXP) {
            numLevelUp++;
            this.level++;

            if (this.happiness < 100) this.happiness += 3;
            else if (this.happiness < 160) this.happiness += 2;
            
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
        const foesDatas = await foe.getDatasForXP();
        const trainerDatas = await trainer.getDatasFromTrainer();
        
        let experience1 = ((foesDatas.specie.baseXP * foe.level / 5)
                * ((2 * foe.level + 10) / (foe.level + this.level + 10))**2.5 + 1);
        let experience2 = ((foesDatas.specie.baseXP * foe.level / 10)
                * ((2 * foe.level + 10) / (foe.level + this.level + 10))**2.5 + 1);
        
        if (this.exchanged) {
            experience1 *= 1.5;
            experience2 *= 1.5;
        }
        if (trainerDatas.getLuckyEgg) {
            experience1 *= 1.5;
            experience2 *= 1.5;
        }
        if (foesDatas.evolutions.length > 0) {
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

    async getMinXP() {
        const specie = await this.getSpecie();
        return specie.calculateLvlXP(this.level - 1);
    }

    async setMinXP() {
        this.actualXP = await this.getMinXP();
        this.save();
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

    getXPRate = async () =>
        (this.actualXP - await this.getMinXP()) / (await this.getMaxXP() - await this.getMinXP());

    async evolutionsList() {
        const specie = await this.getSpecie();
        return specie.evolutionsList(this);
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
    }
}, {
    sequelize: dataBaseTable,
    modelName: 'creature',
    timestamps: false
});

module.exports = Pokemon_Creature;