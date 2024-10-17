const {
    SlashCommandBuilder,
    ChatInputCommandInteraction
} = require('discord.js');
const { getTrainers } = require('../datas/generalFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('evolute_pokemon')
        .setDescription(`Permet de faire évoluer un pokémon.`),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    execute: async interaction => await interaction.reply(await getTrainers(interaction.user.id, 'evolution'))
}