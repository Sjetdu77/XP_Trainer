const {
    StringSelectMenuInteraction
} = require('discord.js');
const { Stocks } = require('../datas/stock');
const { setMenuBuilder } = require('../datas/generalFunctions');

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @returns 
 */
async function return_exchange(interaction) {
    const userId = interaction.user.id;
    const stock = Stocks.getStock(userId);
    stock.creature = stock.team[interaction.values[0]];
    const component = await setMenuBuilder(userId, stock.chosenTrainer, 'leave', 'Qui à délaisser ?');

    return await interaction.update({
        content: `Quel pokémon voulez-vous délaisser ?`,
        components: [ component ]
    });
}

module.exports = return_exchange;