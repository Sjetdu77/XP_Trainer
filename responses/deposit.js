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
async function deposit(interaction) {
    const userId = interaction.user.id;
    const component = await setMenuBuilder(
        userId, Stocks.getStock(userId).chosenTrainer,
        'deposited', 'Qui à déposer ?', false, true
    );
    if (typeof component === 'string') return await interaction.reply({
        content: component,
        ephemeral: true
    });

    await interaction.update({
        content: 'Choisissez les pokémons à déposer.',
        components: [component]
    });
}

module.exports = deposit;