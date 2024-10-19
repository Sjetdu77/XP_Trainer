const {
    SlashCommandBuilder,
    ChatInputCommandInteraction
} = require("discord.js");
const { Stocks } = require("../datas/stock");
const { getTrainers } = require("../datas/generalFunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('exchange_pokemon')
        .setDescription("Permet d'échanger les pokémons.")
        .addStringOption(option => 
            option.setName('pokemon')
                .setDescription('Espèce du pokémon échangé')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('Niveau du pokémon échangé')
        )
        .addStringOption(option =>
            option.setName('nickname')
                .setDescription('Surnom du pokémon échangé')
        ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const userId = interaction.user.id;
        const stock = Stocks.getStock(userId);
        const allOptions = interaction.options;

        let nickname = allOptions.getString('nickname');
        if (nickname) nickname = nickname.trim();

        stock.datas = {
            pokemon: allOptions.getString('pokemon', true).trim(),
            level: allOptions.getInteger('level'),
            nickname
        };

        return await interaction.reply(await getTrainers(userId, 'exchange_pokemon'));
    }
}