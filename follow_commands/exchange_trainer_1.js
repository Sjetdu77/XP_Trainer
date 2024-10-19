const {
    StringSelectMenuInteraction
} = require('discord.js');
const { Stocks } = require("../datas/stock");
const { getTrainers } = require('../datas/generalFunctions');

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @returns 
 */
async function exchange_trainer_1(interaction) {
    const userId = interaction.user.id;
    const stock = Stocks.getStock(userId);
    const datas = stock.datas;
    datas.trainer = stock.chosenTrainer;
    return await interaction.update(await getTrainers(datas.otherUser, 'exchange_trainer_2', stock.chosenTrainer));
}

module.exports = exchange_trainer_1;