const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require('discord.js');
const { Pokemon_Trainer, Pokemon_Creature } = require('../classes');
const { createCreature } = require('../datas/generalFunctions');
const { Stock } = require('../datas/stock');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('creature_beatted')
        .setDescription(`Un pokémon a été vaincu.`)
        .addStringOption(option => 
            option.setName('trainer')
                .setDescription('Dresseur qui a vaincu le pokémon')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('specie')
                .setDescription('Espèce du pokémon sauvage')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('Niveau du pokémon sauvage')
                .setRequired(true)
        ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const trainer = interaction.options.getString('trainer');
        const specie = interaction.options.getString('specie');
        const level = interaction.options.getInteger('level');
        const returned = await createCreature(interaction, null, specie, level);

        const userId = interaction.user.id;
        const trainerFounded = await Pokemon_Trainer.findOne({
            where: { name: trainer, userId},
            include: [ Pokemon_Trainer.Team ]
        });
        if (!trainerFounded) {
            return await interaction.reply({
                content: `${trainer} n'est pas un Dresseur.`,
                ephemeral: true
            });
        }

        const creatures = await trainerFounded.getCreatures({ where: { place: 'team' }, include: [ Pokemon_Creature.Specie ] });
        if (creatures.length === 0) {
            return await interaction.reply({
                content: `Mais ${trainer} n'a pas de pokémon !`,
                ephemeral: true
            });
        }

        let options = [];
        for (const creature of creatures) {
            const specie = await creature.getSpecie();
            options.push({
                label: creature.nickname ? creature.nickname : specie.name,
                description: `${specie.name} niveau ${creature.level}`,
                value: `${creature.id}`
            })
        }

        const winners = new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('winners')
                                .setPlaceholder('No winner?')
                                .setMinValues(1)
                                .setMaxValues(6)
                                .addOptions(options)
                        )

        if (returned) {
            Stock.creatureSaved[trainerFounded.id] = returned;
            return await interaction.reply({
                content: `Un ${specie.split('/')[0]} a été vaincu. Qui l'a battu ?`,
                components: [winners]
            });
        }
    }
}