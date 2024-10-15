const {
    SlashCommandBuilder,
    ChatInputCommandInteraction
} = require('discord.js');
const { Stock } = require('../datas/stock');
const { setMenuBuilder } = require('../datas/generalFunctions');

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
        const experience = interaction.options.getInteger('xp');
        const [trainer, component] = await setMenuBuilder(
            interaction.user.id,
            interaction.options.getString('trainer').trim(),
            'experience', 'Qui à entraîner ?'
        )
        if (trainer === null) return await interaction.reply({
            content: component,
            ephemeral: true
        });

        Stock.numberSaved[trainer.id] = experience;

        return await interaction.reply({
            content: `Quel pokémon a le droit à ${experience} points d'expérience de plus ?`,
            components: [ component ]
        });
    }
}