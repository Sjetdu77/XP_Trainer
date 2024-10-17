const {
    ChatInputCommandInteraction,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require('discord.js');
const { Pokemon_Creature } = require('../classes');
const { getName } = require('../datas/generalFunctions');
const { Stocks } = require('../datas/stock');

/**
 * 
 * @param {ChatInputCommandInteraction} interaction 
 * @returns 
 */
async function evolution(interaction) {
    const userId = interaction.user.id;
    const stock = Stocks.getStock(userId);

    const creatures = await stock.chosenTrainer.getCreatures({
        where: { place: 'team' },
        include: [ Pokemon_Creature.Specie ]
    });

    let options = [], teamSaved = {};
    for (const creature of creatures){
        if (await creature.canEvolute()) {
            teamSaved[`${creature.id}`] = creature;
            options.push({
                label: await getName(creature),
                description: `${await creature.getSpecieName()} niveau ${creature.level}`,
                value: `${creature.id}`
            })
        }
    }

    stock.team = teamSaved;

    if (options.length === 0) return await interaction.reply({
        content: `Désolé, mais aucun pokémon ne peut évoluer.`,
        ephemeral: true
    });
    else return await interaction.update({
        content: `Quel pokémon a le droit d'évoluer ?`,
        components: [
            new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('evolute')
                        .setPlaceholder('Qui à évoluer ?')
                        .addOptions(options)
                )
        ]
    });

}

module.exports = evolution;