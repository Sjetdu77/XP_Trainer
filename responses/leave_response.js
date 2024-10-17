const {
    StringSelectMenuInteraction
} = require('discord.js');
const { Stocks } = require('../datas/stock');

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @returns 
 */
async function leave_response(interaction) {
    const userId = interaction.user.id;
    const stock = Stocks.getStock(userId);
    const creature = stock.team[interaction.values[0]];
    const exchanged = stock.creature;

    creature.update({ place: 'exchanged' });
    exchanged.update({ place: 'team' });

    await interaction.update({
        content: `Echange accomplie !`,
        components: [ ]
    });

    stock.clear();
}

module.exports = leave_response;