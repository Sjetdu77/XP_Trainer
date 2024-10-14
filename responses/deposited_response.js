const {
    StringSelectMenuInteraction
} = require('discord.js');
const { Stock } = require('../datas/stock');
const { Pokemon_Creature } = require('../classes');

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @returns 
 */
async function deposited_response(interaction) {
    const userId = interaction.user.id;
    const selected = interaction.values;
    const trainer = Stock.trainerSaved[userId];
    const allCreaturesTeam = await trainer.getCreatures({
        where: { place: 'team' },
        include: [ Pokemon_Creature.Specie ]
    });

    for (const creature of allCreaturesTeam)
        if (selected.includes(`${creature.id}`))
            creature.update({ place: 'computer' });

    await interaction.update({
        content: `Pokémons déposés !`,
        components: []
    });
    Stock.trainerSaved[userId] = null;
}

module.exports = deposited_response;