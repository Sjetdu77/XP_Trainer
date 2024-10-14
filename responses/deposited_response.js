const {
    StringSelectMenuInteraction
} = require('discord.js');
const { Stock } = require('../datas/stock');

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @returns 
 */
async function deposited_response(interaction) {
    const userId = interaction.user.id;
    const selected = interaction.values;
    const trainer = Stock.trainerSaved[userId];

    for (const [id, creature] of Object.entries(Stock.teamSaved[trainer.id]))
        if (selected.includes(id)) creature.update({ place: 'computer' });

    await interaction.update({
        content: `Pokémons déposés !`,
        components: []
    });
    Stock.trainerSaved[userId] = null;
}

module.exports = deposited_response;