const {
    SlashCommandBuilder,
    ChatInputCommandInteraction
} = require('discord.js');
const { Stocks } = require('../datas/stock');
const { getTrainers } = require('../datas/generalFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get_lvl')
        .setDescription(`Permet de gagner des niveaux.`)
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
        const userId = interaction.user.id;
        Stocks.getStock(userId).datas = { lvls: interaction.options.getInteger('lvls', true) };
        return await interaction.reply(await getTrainers(userId, 'get_lvls'));
    }
}