const {
    StringSelectMenuInteraction
} = require('discord.js');
const { Stocks } = require('../datas/stock');
const { getName } = require('../datas/generalFunctions');

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @returns 
 */
async function set_happiness(interaction) {
    const userId = interaction.user.id;
    const stock = Stocks.getStock(userId);
    const creature = stock.team[interaction.values[0]];
    const gain = creature.changeHappiness(stock.datas);

    return await interaction.update({
        content: `${await getName(creature)} a maintenant ${gain} points de bonheur.\n`,
        components: []
    });
}

module.exports = set_happiness;