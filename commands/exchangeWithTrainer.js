const {
    SlashCommandBuilder,
    ChatInputCommandInteraction
} = require("discord.js");
const { Stocks } = require("../datas/stock");
const { getTrainers } = require("../datas/generalFunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('exchange_with_trainer')
        .setDescription("Permet d'échanger un pokémon avec un autre dresseur.")
        .addUserOption(option =>
            option.setName('user')
                  .setDescription('Joueur dont appartient le dresseur.')
                  .setRequired(true)
        ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const userId = interaction.user.id;
        Stocks.getStock(userId).datas = { otherUser: interaction.options.getUser('user', true).id };
        return await interaction.reply(await getTrainers(userId, 'exchange_trainer_1'));
    }
}