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
async function correction_response(interaction) {
    const userId = interaction.user.id;
    const selected = interaction.values;
    const trainer = Stock.trainerSaved[userId];

    var content = '';
    for (const [id, creature] of Object.entries(Stock.teamSaved[trainer.id])) {
        if (selected.includes(id)) {
            const name = await getName(creature);
            const loses = await creature.minusXPViaFoe(Stock.creatureSaved[trainer.id]);
            const lvlLost = loses[1];
            content += `${name} perd ${loses[0]} points d'expérience.\n`;
            if (lvlLost > 0) content += `${name} perd ${lvlLost} niveau${lvlLost > 1 ? 'x' : ''}.\n`;
            content += '\n';
        }
    }

    await interaction.update({
        content,
        components: []
    });

    Stock.creatureSaved[trainer.id] = null;
    Stock.teamSaved[trainer.id] = null;
    Stock.trainerSaved[userId] = null;
}

module.exports = correction_response;