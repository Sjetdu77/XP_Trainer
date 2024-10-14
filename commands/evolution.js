const {
    SlashCommandBuilder,
    ChatInputCommandInteraction
} = require('discord.js');
const { Pokemon_Trainer } = require('../classes');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('evolute_pokemon')
        .setDescription(`Permet de gagner de l'expérience brut.`)
        .addStringOption(option => 
            option.setName('trainer')
                .setDescription('Dresseur associé')
                .setRequired(true)
        ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const userId = interaction.user.id;
        const trainer = interaction.options.getString('trainer').trim();
        const trainerFounded = await Pokemon_Trainer.findOne({
            where: { name: trainer, userId }
        });
        if (!trainerFounded) {
            return await interaction.reply({
                content: `${trainer} n'est pas un Dresseur.`,
                ephemeral: true
            });
        }

        

        //let evolutionFounded = await specieFounded.getEvolutions({ where: { name: evolution } });
    }
}