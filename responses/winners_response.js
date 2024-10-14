const {
    StringSelectMenuInteraction
} = require('discord.js');
const { Stock } = require('../datas/stock');
const { getName } = require('../datas/generalFunctions');

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 */
async function winners_response(interaction) {
    const userId = interaction.user.id;
    const selected = interaction.values;
    const trainer = Stock.trainerSaved[userId];
    let content = ``;

    for (const [id, creature] of Object.entries(Stock.teamSaved[trainer.id])) {
        const gains = await creature.gainXPViaFoe(Stock.creatureSaved[trainer.id], selected.includes(id));
        const name = await getName(creature);
        content += `${name} gagne ${gains[0]} points d'expérience.\n`;
        if (gains[1] > 0) content += `${name} gagne ${gains[1]} niveau${gains[1] > 1 ? 'x' : ''}.\n`
        content += '\n';
    }

    await interaction.update({
        content,
        components: []
    });
    
    Stock.creatureSaved[trainer.id] = null;
    Stock.trainerSaved[userId] = null;
}

module.exports = winners_response;