const {
    SlashCommandBuilder,
    ChatInputCommandInteraction
} = require('discord.js');
const { Stocks } = require('../datas/stock');
const { getTrainers } = require('../datas/generalFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('correction_exp')
        .setDescription(`Permet de retirer l'expérience gagné par erreur.`)
        .addStringOption(option => 
            option.setName('foe')
                .setDescription('Espèce du pokémon adverse')
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
        const userId = interaction.user.id;
        const allOptions = interaction.options;
        Stocks.getStock(userId).datas = {
            foe: allOptions.getString('foe', true).trim(),
            level: allOptions.getInteger('level', true)
        }
        return await interaction.reply(await getTrainers(userId, 'correction_xp'));
    }
}