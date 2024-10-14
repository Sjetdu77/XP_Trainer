const {
    StringSelectMenuInteraction,
	ActionRowBuilder,
    StringSelectMenuBuilder,
} = require('discord.js');
const { Stock } = require('../datas/stock');
const { Pokemon_Creature } = require('../classes');

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @returns 
 */
async function deposit_response(interaction) {
    const userId = interaction.user.id;
    const trainer = Stock.trainerSaved[userId];
    const allCreaturesTeam = await trainer.getCreatures({
        where: { place: 'team' },
        include: [ Pokemon_Creature.Specie ]
    });

    let team = [];

    for (const creature of allCreaturesTeam) {
        const specie = await creature.getSpecie();
        team.push({
            label: creature.nickname ? creature.nickname : specie.name,
            description: `${await creature.getSpecieName()} niveau ${creature.level}`,
            value: `${creature.id}`
        })
    }

    const choices = new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('deposited')
                            .setPlaceholder('Qui à déposer ?')
                            .setMinValues(1)
                            .setMaxValues(team.length - 1)
                            .addOptions(team)
                    )

    await interaction.update({
        content: 'Choisissez les pokémons à déposer.',
        components: [choices]
    });
}

module.exports = deposit_response;