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
async function experience_response(interaction) {
    const userId = interaction.user.id;
    const selected = interaction.values[0];
    const trainer = Stock.trainerSaved[userId];
    const creature = Stock.teamSaved[trainer.id][selected];

    const name = await getName(creature);
    const experience = Stock.numberSaved[trainer.id];
    const gain = await creature.gainXP(experience);
    let content = `${name} gagne ${experience} points d'expérience.`;
    if (gain > 0)
        content += `\n${name} gagne ${gain} niveaux.`;
    await interaction.update({
        content,
        components: []
    });

    Stock.numberSaved[trainer.id] = null;
    Stock.trainerSaved[userId] = null;
}

module.exports = experience_response;