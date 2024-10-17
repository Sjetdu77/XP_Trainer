const {
    StringSelectMenuInteraction
} = require('discord.js');
const { Stocks } = require('../datas/stock');
const { getName } = require('../datas/generalFunctions');

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @returns 
 */
async function experience_response(interaction) {
    const userId = interaction.user.id;
    const stock = Stocks.getStock(userId);
    const creature = stock.team[interaction.values[0]];

    const name = await getName(creature);
    const experience = stock.datas.xp;
    const gain = await creature.gainXP(experience);
    let content = `${name} gagne ${experience} points d'expérience.`;
    if (gain > 0)
        content += `\n${name} gagne ${gain} niveaux.`;
    await interaction.update({
        content,
        components: []
    });

    stock.clear();
}

module.exports = experience_response;