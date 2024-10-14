const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require('discord.js');
const { createCreature, setAllOptions } = require('../datas/generalFunctions');
const { Stock } = require('../datas/stock');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('creature_beatted')
        .setDescription(`Un pokémon a été vaincu.`)
        .addStringOption(option => 
            option.setName('trainer')
                .setDescription('Dresseur associé')
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
        const trainer = interaction.options.getString('trainer').trim();
        const specie = interaction.options.getString('specie').trim();
        const level = interaction.options.getInteger('level');
        const returned = await createCreature(interaction, null, specie, level);
        if (!returned)
            return await interaction.reply({
                content: `Désolé, le pokémon n'existe pas.`,
                ephemeral: true
            });

        const userId = interaction.user.id;
        const [trainerFounded, options] = await setAllOptions(userId, trainer);
        if (typeof options === 'string')
            return await interaction.reply({
                content: options,
                ephemeral: true
            });

        Stock.trainerSaved[userId] = trainerFounded;
        Stock.creatureSaved[trainerFounded.id] = returned;

        return await interaction.reply({
            content: `Un ${await returned.getSpecieName()} a été vaincu. Qui l'a battu ?`,
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('winners')
                            .setPlaceholder('Pas de vainqueur ?')
                            .setMinValues(1)
                            .setMaxValues(options.length)
                            .addOptions(options)
                    )
            ]
        });
    }
}