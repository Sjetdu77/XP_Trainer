const {
    StringSelectMenuInteraction
} = require('discord.js');
const { Stock } = require('../datas/stock');
const { Pokemon_Creature } = require('../classes');

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 */
async function winners_response(interaction) {
    const userId = interaction.user.id;
    const selected = interaction.values;
    const trainer = Stock.trainerSaved[userId];
    const allCreaturesTeam = await trainer.getCreatures({
        where: { place: 'team' },
        include: [ Pokemon_Creature.Specie ]
    });
    let content = ``;

    for (const creature of allCreaturesTeam) {
        const specie = await creature.getSpecie();
        const gains = await creature.gainXPViaFoe(Stock.creatureSaved[trainer.id], selected.includes(`${creature.id}`));
        content += `${creature.nickname ? creature.nickname : specie.name} gagne ${gains[0]} points d'expérience.\n`;
        if (gains[1] > 0)
            content += `${creature.nickname ? creature.nickname : specie.name} gagne ${gains[1]} niveau${gains[1] > 1 ? 'x' : ''}.\n`

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