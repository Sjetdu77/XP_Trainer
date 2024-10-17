const {
    SlashCommandBuilder,
    ChatInputCommandInteraction
} = require("discord.js");
const { getTrainers } = require("../datas/generalFunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('return_exchanged')
        .setDescription(`Permet de reprendre un pokémon échangé.`),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction
     */
    execute: async (interaction) => await interaction.reply(await getTrainers(interaction.user.id, 'return_exchanged'))
}