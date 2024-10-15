const {
    StringSelectMenuInteraction
} = require('discord.js');
const { Stock } = require('../datas/stock');
const { setMenuBuilder } = require('../datas/generalFunctions');

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @returns 
 */
async function deposit_response(interaction) {
    const userId = interaction.user.id;
    const [trainer, component] = await setMenuBuilder(
        userId, Stock.trainerSaved[userId].name,
        'deposited', 'Qui à déposer ?', true, true
    )
    if (trainer === null) return await interaction.reply({
        content: component,
        ephemeral: true
    });

    await interaction.update({
        content: 'Choisissez les pokémons à déposer.',
        components: [component]
    });
}

module.exports = deposit_response;