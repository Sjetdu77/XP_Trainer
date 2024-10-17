const {
    SlashCommandBuilder,
    ChatInputCommandInteraction
} = require('discord.js');
const { Stocks } = require('../datas/stock');
const { getTrainers } = require('../datas/generalFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get_exp')
        .setDescription(`Permet de gagner de l'expérience brut.`)
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
        const userId = interaction.user.id;
        const stock = Stocks.getStock(userId);
        const allOptions = interaction.options;
        stock.datas = { xp: allOptions.getInteger('xp', true) };
        
        return await interaction.reply(await getTrainers(userId, 'get_xp'));
    }
}