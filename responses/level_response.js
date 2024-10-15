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
async function level_response(interaction) {
    const userId = interaction.user.id;
    const selected = interaction.values[0];
    const trainer = Stock.trainerSaved[userId];
    const creature = Stock.teamSaved[trainer.id][selected];

    const name = await getName(creature);
    const levels = Stock.numberSaved[trainer.id];
    creature.gainLevels(levels);
    await interaction.update({
        content: `${name} gagne ${levels} niveau${levels > 1 ? 'x' : ''}.`,
        components: []
    });

    Stock.numberSaved[trainer.id] = null;
    Stock.trainerSaved[userId] = null;
}

module.exports = level_response;