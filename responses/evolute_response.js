const {
    StringSelectMenuInteraction,
	ActionRowBuilder,
    StringSelectMenuBuilder,
} = require('discord.js');
const { Stock } = require('../datas/stock');
const { Pokemon_Specie } = require('../classes');
const { getName } = require('../datas/generalFunctions');

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @returns 
 */
async function evolute_response(interaction) {
    const userId = interaction.user.id;
    const selected = interaction.values[0];
    const trainer = Stock.trainerSaved[userId];
    const creature = Stock.teamSaved[trainer.id][selected];
    const name = await getName(creature);
    const evolutions = await creature.getGoodEvolutions();
    if (evolutions.length === 1) {
        const newSpecie = await creature.evolution(evolutions[0]);
        return await interaction.update({
            content: `${name} a évolué en ${newSpecie.name} !`,
            components: []
        });
    }
    else if (evolutions.length > 1) {
        let creatureSaved = {};
        let options = [];
        for (const evolution of evolutions) {
            const specie = await Pokemon_Specie.findOne({ where: { id: evolution.evolutionId } });
            options.push({
                label: specie.getSpecieName(),
                value: `${specie.id}`
            });
            creatureSaved[`${specie.id}`] = evolution;
        }
        Stock.creatureSaved[trainer.id] = creatureSaved;
        Stock.teamSaved[trainer.id] = creature;

        return await interaction.update({
            content: `Quelle évolution on attribue à ${name} ?`,
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('evolution')
                            .setPlaceholder('Quelle évolution ?')
                            .addOptions(options)
                    )
            ]
        });
    }
}

module.exports = evolute_response;