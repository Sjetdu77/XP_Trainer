const {
    ChatInputCommandInteraction
} = require("discord.js");
const { Stocks } = require('../datas/stock');
const { setMenuBuilder } = require('../datas/generalFunctions');

/**
 * 
 * @param {ChatInputCommandInteraction} interaction 
 * @returns 
 */
async function rename_pokemon(interaction) {
    const userId = interaction.user.id;
    const component = await setMenuBuilder(userId, Stocks.getStock(userId).chosenTrainer, 'rename_choice', 'A renommer');

    return await interaction.update({
        content: `Qui est-ce que vous voulez renommer ?`,
        components: [ component ]
    });
}

module.exports = rename_pokemon;