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
async function level_response(interaction) {
    const userId = interaction.user.id;
    const selected = interaction.values[0];
    const trainer = Stock.trainerSaved[userId];
    const creatures = await trainer.getCreatures({
        where: {
            id: parseInt(selected),
            place: 'team'
        },
        include: [ Pokemon_Creature.Specie ]
    });
    const creature = creatures[0];

    const specie = await creature.getSpecie();
    const name = creature.nickname ? creature.nickname : specie.name;
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