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
async function experience_response(interaction) {
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
    const experience = Stock.numberSaved[trainer.id];
    const gain = await creature.gainXP(experience);
    let content = `${name} gagne ${experience} points d'expérience.`;
    if (gain > 0)
        content += `${name} gagne ${gain} niveaux.`;
    await interaction.update({
        content,
        components: []
    });

    Stock.numberSaved[trainer.id] = null;
    Stock.trainerSaved[userId] = null;
}

module.exports = experience_response;