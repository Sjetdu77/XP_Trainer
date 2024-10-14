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
async function correction_response(interaction) {
    const userId = interaction.user.id;
    const selected = interaction.values;
    const trainer = Stock.trainerSaved[userId];
    const allCreaturesTeam = await trainer.getCreatures({
        where: { place: 'team' },
        include: [ Pokemon_Creature.Specie ]
    });

    var content = '';
    for (const creature of allCreaturesTeam)
        if (selected.includes(`${creature.id}`)) {
            const specie = await creature.getSpecie();
            const name = creature.nickname ? creature.nickname : specie.name;
            const loses = await creature.minusXPViaFoe(Stock.creatureSaved[trainer.id]);
            const lvlLost = loses[1];
            content += `${name} perd ${loses[0]} points d'expérience.\n`;
            if (lvlLost > 0)
                content += `\n${name} perd ${lvlLost} niveau${lvlLost > 1 ? 'x' : ''}.\n`;

            content += '\n';
        }

    await interaction.update({
        content,
        components: []
    });

    Stock.creatureSaved[trainer.id] = null;
    Stock.trainerSaved[userId] = null;
}

module.exports = correction_response;