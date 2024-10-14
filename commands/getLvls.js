const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require('discord.js');
const { setAllOptions } = require('../datas/generalFunctions');
const { Stock } = require('../datas/stock');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get_lvl')
        .setDescription(`Permet de gagner des niveaux.`)
        .addStringOption(option => 
            option.setName('trainer')
                .setDescription('Dresseur associé')
                .setRequired(true)
        )
        .addIntegerOption(option => 
            option.setName('lvls')
                .setDescription(`Niveaux gagnés`)
                .setRequired(true)
        ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const trainer = interaction.options.getString('trainer').trim();
        const levels = interaction.options.getInteger('lvls');
        const userId = interaction.user.id;
        const [trainerFounded, options] = await setAllOptions(userId, trainer);
        if (typeof options === 'string')
            return await interaction.reply({
                content: options,
                ephemeral: true
            });

        Stock.numberSaved[trainerFounded.id] = levels;

        return await interaction.reply({
            content: `Quel pokémon a le droit à ${levels} niveau${levels > 1 ? 'x' : ''} de plus ?`,
            components: [
                new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('levels')
                                .setPlaceholder('Qui à entraîner ?')
                                .addOptions(options)
                        )
            ]
        });
    }
}