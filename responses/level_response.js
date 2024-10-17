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
async function level_response(interaction) {
    const userId = interaction.user.id;
    const stock = Stocks.getStock(userId);
    const creature = stock.team[interaction.values[0]];

    const name = await getName(creature);
    const levels = stock.datas.lvls;
    creature.gainLevels(levels);
    await interaction.update({
        content: `${name} gagne ${levels} niveau${levels > 1 ? 'x' : ''}.`,
        components: []
    });

    stock.clear();
}

module.exports = level_response;