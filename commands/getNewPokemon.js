const {
    SlashCommandBuilder,
    ChatInputCommandInteraction
} = require('discord.js');
const { getTrainers } = require('../datas/generalFunctions');
const { Stocks } = require('../datas/stock');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get_new_pokemon')
        .setDescription(`Permet d'obtenir un nouveau pokémon.`)
        .addStringOption(option => 
            option.setName('specie')
                .setDescription('Espèce du pokémon')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('Niveau du pokémon')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('nickname')
                .setDescription(`Surnom du pokémon`)
        ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const userId = interaction.user.id;
        const allOptions = interaction.options;
        let nickname = allOptions.getString('nickname');
        if (nickname) nickname = nickname.trim();

        Stocks.getStock(userId).datas = {
            specie: allOptions.getString('specie', true),
            level: allOptions.getInteger('level', true),
            nickname
        };

        return await interaction.reply(await getTrainers(userId, 'get_new_pokemon'));
    }
}