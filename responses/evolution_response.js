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
async function evolution_response(interaction) {
    const selected = interaction.values[0];
    const trainer = Stock.trainerSaved[interaction.user.id];
    const creature = Stock.teamSaved[trainer.id];
    const name = await getName(creature);
    const newSpecie = await creature.evolution(Stock.creatureSaved[trainer.id][selected]);

    return await interaction.update({
        content: `${name} a évolué en ${newSpecie.getSpecieName()} !`,
        components: []
    });
}

module.exports = evolution_response;