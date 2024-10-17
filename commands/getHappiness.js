const {
    SlashCommandBuilder,
    ChatInputCommandInteraction
} = require('discord.js');
const { getTrainers } = require('../datas/generalFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get_happiness')
        .setDescription(`Permet de gagner ou perdre des points de bonheur.`),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    execute: async (interaction) => await interaction.reply(await getTrainers(interaction.user.id, 'get_happiness'))
}