const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require('discord.js');
const { Stock } = require('../datas/stock');
const { setAllOptions } = require('../datas/generalFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get_exp')
        .setDescription(`Permet de gagner de l'expérience brut.`)
        .addStringOption(option => 
            option.setName('trainer')
                .setDescription('Dresseur associé')
                .setRequired(true)
        )
        .addIntegerOption(option => 
            option.setName('xp')
                .setDescription(`Points d'expérience gagnés`)
                .setRequired(true)
        ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const trainer = interaction.options.getString('trainer').trim();
        const experience = interaction.options.getInteger('xp');
        const userId = interaction.user.id;
        const [trainerFounded, options] = await setAllOptions(userId, trainer);
        if (typeof options === 'string')
            return await interaction.reply({
                content: options,
                ephemeral: true
            });

        Stock.numberSaved[trainerFounded.id] = experience;

        return await interaction.reply({
            content: `Quel pokémon a le droit à ${experience} points d'expérience de plus ?`,
            components: [
                new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('experience')
                                .setPlaceholder('Qui à entraîner ?')
                                .addOptions(options)
                        )
            ]
        });
    }
}