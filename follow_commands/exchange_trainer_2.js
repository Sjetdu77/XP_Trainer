const {
    StringSelectMenuInteraction
} = require('discord.js');
const { Stocks } = require("../datas/stock");
const { setMenuBuilder } = require("../datas/generalFunctions");

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @returns 
 */
async function exchange_trainer_2(interaction) {
    const userId = interaction.user.id;
    const component = await setMenuBuilder(
        userId, Stocks.getStock(userId).datas.trainer,
        'exchange_trainer_1', "Qui à échanger ?"
    );
    if (typeof component === 'string') return await interaction.reply({
        content: component,
        ephemeral: true
    });

    return await interaction.update({
        content: `Choisissez un pokémon à échanger.`,
        components: [ component ]
    })
}

module.exports = exchange_trainer_2;