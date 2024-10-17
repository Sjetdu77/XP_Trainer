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
async function get_lvls(interaction) {
    const userId = interaction.user.id;
    const stock = Stocks.getStock(userId);
    const levels = stock.datas.lvls;
    const component = await setMenuBuilder(userId, stock.chosenTrainer, 'levels', 'Qui à entraîner ?');

    return await interaction.update({
        content: `Quel pokémon a le droit à ${levels} niveau${levels > 1 ? 'x' : ''} de plus ?`,
        components: [ component ]
    });
}

module.exports = get_lvls;