const {
    StringSelectMenuInteraction
} = require("discord.js");
const { Stocks } = require('../datas/stock');
const { setMenuBuilder } = require('../datas/generalFunctions');

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @returns 
 */
async function return_exchanged(interaction) {
    const userId = interaction.user.id;
    const stock = Stocks.getStock(userId);
    const component = await setMenuBuilder(
        userId, stock.chosenTrainer, 'return_exchange',
        'Qui à reprendre', true, false, 'exchanged'
    );

    if (component.components[0].options.length === 0) return await interaction.reply({
        content: `Vous n'avez pas de pokémon à récupérer.`,
        ephemeral: true
    });

    return await interaction.update({
        content: `Quel pokémon voulez-vous récupérer ?`,
        components: [ component ]
    });
}

module.exports = return_exchanged;