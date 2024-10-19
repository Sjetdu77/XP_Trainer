const {
    StringSelectMenuInteraction
} = require('discord.js');
const { Stocks } = require('../datas/stock');

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @returns 
 */
async function deposited(interaction) {
    const userId = interaction.user.id;
    const stock = Stocks.getStock(userId);

    for (const [id, creature] of Object.entries(stock.team))
        if (interaction.values.includes(id)) creature.update({ place: 'computer' });

    await interaction.update({
        content: `Pokémons déposés !`,
        components: []
    });
    stock.clear();
}

module.exports = deposited;