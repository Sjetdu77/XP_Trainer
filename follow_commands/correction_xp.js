const {
    StringSelectMenuInteraction
} = require('discord.js');
const { createCreature, setMenuBuilder } = require("../datas/generalFunctions");
const { Stocks } = require("../datas/stock");

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @returns 
 */
async function correction_xp(interaction) {
    const userId = interaction.user.id;
    const stock = Stocks.getStock(userId);
    const datas = stock.datas;
    const component = await setMenuBuilder(
        userId, stock.chosenTrainer,
        'correction', 'Qui à corriger ?', false, true
    )
    if (typeof component === 'string') return await interaction.reply({
        content: component,
        ephemeral: true
    });

    const returned = await createCreature(interaction, null, datas.foe, datas.level);
    if (!returned) return await interaction.reply({
        content: `Désolé, le pokémon n'existe pas.`,
        ephemeral: true
    });

    stock.creature = returned;
    return await interaction.update({
        content: `Quel pokémon est-ce qu'on va retirer l'expérience ?`,
        components: [ component ]
    });
}

module.exports = correction_xp;