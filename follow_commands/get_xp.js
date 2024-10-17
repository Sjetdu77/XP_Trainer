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
async function get_xp(interaction) {
    const userId = interaction.user.id;
    const stock = Stocks.getStock(userId);
    const component = await setMenuBuilder(userId, stock.chosenTrainer, 'experience', 'Qui à entraîner ?');

    return await interaction.update({
        content: `Quel pokémon a le droit à ${stock.datas.xp} points d'expérience de plus ?`,
        components: [ component ]
    });
}

module.exports = get_xp;