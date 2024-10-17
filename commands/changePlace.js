const {
    SlashCommandBuilder,
} = require('discord.js');
const { getTrainers } = require('../datas/generalFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('change_place')
        .setDescription(`Permet à un pokémon de changer de place entre l'équipe et le PC.`),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    execute: async interaction => await interaction.reply(await getTrainers(interaction.user.id, 'change_place'))
}