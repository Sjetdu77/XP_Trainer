const {
    SlashCommandBuilder,
    ChatInputCommandInteraction
} = require('discord.js');
const { Stock } = require('../datas/stock');
const { createCreature, setMenuBuilder } = require('../datas/generalFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('correction_exp')
        .setDescription(`Permet de retirer l'expérience gagné par erreur.`)
        .addStringOption(option => 
            option.setName('trainer')
                .setDescription('Dresseur associé')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('foe')
                .setDescription('Le Pokémon adverse battu')
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
        const [trainer, component] = await setMenuBuilder(
            interaction.user.id,
            interaction.options.getString('trainer').trim(),
            'correction', 'Qui à corriger ?', true, true
        )
        if (trainer === null) return await interaction.reply({
            content: component,
            ephemeral: true
        });

        const foe = interaction.options.getString('foe').trim();
        const level = interaction.options.getInteger('level');
        const returned = await createCreature(interaction, null, foe, level);
        if (!returned)
            return await interaction.reply({
                content: `Désolé, le pokémon n'existe pas.`,
                ephemeral: true
            });


        Stock.creatureSaved[trainer.id] = returned;
        return await interaction.reply({
            content: `Quel pokémon est-ce qu'on va retirer l'expérience ?`,
            components: [ component ]
        });
    }
}