const {
    SlashCommandBuilder,
    ChatInputCommandInteraction
} = require('discord.js');
const { setMenuBuilder } = require('../datas/generalFunctions');

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
        const [trainer, component] = await setMenuBuilder(
            interaction.user.id,
            interaction.options.getString('trainer').trim(),
            'rename_choice', 'A renommer'
        )
        if (trainer === null) return await interaction.reply({
            content: component,
            ephemeral: true
        });

        return await interaction.reply({
            content: `Qui est-ce que vous voulez renommer ?`,
            components: [ component ]
        });
    }
}