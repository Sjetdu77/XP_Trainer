const {
    SlashCommandBuilder,
    ChatInputCommandInteraction
} = require('discord.js');
const { getTrainers } = require('../datas/generalFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rename_pokemon')
        .setDescription(`Permet de renommer un pokémon capturé.`),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    execute: async interaction => await interaction.reply(await getTrainers(interaction.user.id, 'rename_pokemon'))
}