const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require('discord.js');
const { setAllOptions } = require('../datas/generalFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rename_pokemon')
        .setDescription(`Permet de renommer un pokémon capturé.`)
        .addStringOption(option => 
            option.setName('trainer')
                .setDescription('Dresseur associé')
                .setRequired(true)
        ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const trainer = interaction.options.getString('trainer').trim();
        const userId = interaction.user.id;
        const [_, options] = await setAllOptions(userId, trainer);
        if (typeof options === 'string')
            return await interaction.reply({
                content: options,
                ephemeral: true
            });

        return await interaction.reply({
            content: `Qui est-ce que vous voulez renommer ?`,
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('rename_choice')
                            .setPlaceholder('A renommer')
                            .addOptions(options)
                    )
            ]
        });
    }
}