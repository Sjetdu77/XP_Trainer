const {
    StringSelectMenuInteraction,
	ActionRowBuilder,
    StringSelectMenuBuilder,
} = require('discord.js');
const { Stock } = require('../datas/stock');
const { Pokemon_Creature } = require('../classes');
const { getName } = require('../datas/generalFunctions');

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

    let team = [], teamSaved = {};

    for (const creature of allCreaturesTeam) {
        teamSaved[`${creature.id}`] = creature;
        team.push({
            label: await getName(creature),
            description: `${await creature.getSpecieName()} niveau ${creature.level}`,
            value: `${creature.id}`
        })
    }
    Stock.teamSaved[trainer.id] = teamSaved;

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