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
async function evolution_response(interaction) {
    const userId = interaction.user.id;
    const stock = Stocks.getStock(userId);
    const creature = stock.creature;
    const name = await getName(creature);
    const newSpecie = await creature.evolution(stock.team[interaction.values[0]]);

    return await interaction.update({
        content: `${name} a évolué en ${newSpecie.getSpecieName()} !`,
        components: []
    });
}

module.exports = evolution_response;