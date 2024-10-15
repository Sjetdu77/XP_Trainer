const {
    SlashCommandBuilder,
    ChatInputCommandInteraction
} = require('discord.js');
const { Stock } = require('../datas/stock');
const { setMenuBuilder } = require('../datas/generalFunctions');

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
        const [trainer, component] = await setMenuBuilder(
            interaction.user.id,
            interaction.options.getString('trainer').trim(),
            'levels', 'Qui à entraîner ?'
        )
        if (trainer === null) return await interaction.reply({
            content: component,
            ephemeral: true
        });
        const levels = interaction.options.getInteger('lvls');

        Stock.numberSaved[trainer.id] = levels;

        return await interaction.reply({
            content: `Quel pokémon a le droit à ${levels} niveau${levels > 1 ? 'x' : ''} de plus ?`,
            components: [ component ]
        });
    }
}