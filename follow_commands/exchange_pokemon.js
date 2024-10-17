const {
    ChatInputCommandInteraction
} = require("discord.js");
const { Stocks } = require("../datas/stock");
const { setMenuBuilder } = require("../datas/generalFunctions");

/**
 * 
 * @param {ChatInputCommandInteraction} interaction 
 * @returns 
 */
async function exchange_pokemon(interaction) {
    const userId = interaction.user.id;
    const component = await setMenuBuilder(
        userId, Stocks.getStock(userId).chosenTrainer,
        'exchange_solo', 'Qui à échanger ?'
    );
    if (typeof component === 'string') return await interaction.reply({
        content: component,
        ephemeral: true
    });

    return await interaction.update({
        content: `Avec quel pokémon est-ce que vous échangez ?`,
        components: [ component ]
    });
}

module.exports = exchange_pokemon;