const {
    StringSelectMenuInteraction
} = require('discord.js');
const { Stocks } = require('../datas/stock');

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @returns 
 */
async function rename_choice(interaction) {
    const userId = interaction.user.id;
    const stock = Stocks.getStock(userId);
    const creature = stock.team[interaction.values[0]];

    await interaction.update({
        content: `Quel est le nouveau nom du ${await creature.getSpecieName()} ? (Ne tapez que le nom)`,
        components: []
    });

    stock.creature = creature;
    stock.mode = 'rename_type';
}

module.exports = rename_choice;