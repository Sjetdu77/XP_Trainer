const {
    StringSelectMenuInteraction
} = require('discord.js');
const { Stocks } = require('../datas/stock');
const follow_commands = require('../follow_commands');

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @returns 
 */
async function trainer_response(interaction) {
    const stock = Stocks.getStock(interaction.user.id);
    stock.chosenTrainer = stock.trainers[interaction.values[0]];
    return await follow_commands[stock.mode](interaction);
}

module.exports = trainer_response;