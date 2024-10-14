const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require('discord.js');
const { Stock } = require('../datas/stock');
const { createCreature, setAllOptions } = require('../datas/generalFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('correction_exp')
        .setDescription(`Permet de retirer l'expérience gagné par erreur.`)
        .addStringOption(option => 
            option.setName('trainer')
                .setDescription('Dresseur associé')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('foe')
                .setDescription('Le Pokémon adverse battu')
                .setRequired(true)
        )
        .addIntegerOption(option => 
            option.setName('level')
                .setDescription(`Niveau du Pokémon adverse`)
                .setRequired(true)
        ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const trainer = interaction.options.getString('trainer').trim();
        const foe = interaction.options.getString('foe').trim();
        const level = interaction.options.getInteger('level');
        const returned = await createCreature(interaction, null, foe, level);
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

        Stock.creatureSaved[trainerFounded.id] = returned;
        return await interaction.reply({
            content: `Quel pokémon est-ce qu'on va retirer l'expérience ?`,
            components: [
                new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('correction')
                                .setPlaceholder('Qui à corriger ?')
                                .setMinValues(1)
                                .setMaxValues(options.length - 1)
                                .addOptions(options)
                        )
            ]
        });
    }
}