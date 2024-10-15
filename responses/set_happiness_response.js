const {
    StringSelectMenuInteraction
} = require('discord.js');
const { Stock } = require('../datas/stock');
const { getName } = require('../datas/generalFunctions');

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @returns 
 */
async function set_happiness_response(interaction) {
    const userId = interaction.user.id;
    const selected = interaction.values[0];
    const trainer = Stock.trainerSaved[userId];
    const creature = Stock.teamSaved[trainer.id][selected];
    const gain = creature.changeHappiness(Stock.numberSaved[trainer.id]);

    return await interaction.update({
        content: `${await getName(creature)} a maintenant ${gain} points de bonheur.\n`,
        components: []
    });
}

module.exports = set_happiness_response;