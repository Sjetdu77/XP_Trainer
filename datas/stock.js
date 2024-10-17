const { Pokemon_Creature, Pokemon_Trainer } = require("../classes");

class Stock {
    /**
     * 
     * @param {Pokemon_Creature} creature 
     * @param {Pokemon_Trainer} trainer 
     * @param {string} mode 
     */
    constructor(creature=null, trainer=null, mode=null) {
        this.creature = creature;
        this.chosenTrainer = trainer;
        this.trainers = {};
        this.team = {};
        this.mode = mode;
        this.datas = {};
    }

    clear() {
        this.creature = null;
        this.chosenTrainer = null;
        this.trainers = {};
        this.team = {};
        this.mode = null;
        this.datas = {};
    }

    notEmpty = () => (!!this.chosenTrainer || !!this.creature || !!this.mode);
}

class Stocks {
    constructor() {
        this.stocks = {};
    }

    /**
     * 
     * @param {string} userId 
     * @returns {Stock}
     */
    getStock = (userId) => {
        if (!this.stocks[userId]) this.stocks[userId] = new Stock();
        return this.stocks[userId];
    }
}

module.exports = { Stocks: new Stocks() };