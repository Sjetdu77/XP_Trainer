const {
    StringSelectMenuInteraction
} = require('discord.js');
const { Stock } = require('../datas/stock');

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @returns 
 */
async function rename_choice_response(interaction) {
    const userId = interaction.user.id;
    const selected = interaction.values[0];
    const trainer = Stock.trainerSaved[userId];
    const creature = Stock.teamSaved[trainer.id][selected];

    await interaction.update({
        content: `Quel est le nouveau nom du ${await creature.getSpecieName()} ? (Ne tapez que le nom)`,
        components: []
    });

    Stock.creatureSaved[userId] = creature;
    Stock.modeSaved[userId] = 'rename';
}

module.exports = rename_choice_response;