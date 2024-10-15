const {
    SlashCommandBuilder,
    ChatInputCommandInteraction
} = require('discord.js');
const { Stock } = require('../datas/stock');
const { createCreature, setMenuBuilder } = require('../datas/generalFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('creature_beatted')
        .setDescription(`Un pokémon a été vaincu.`)
        .addStringOption(option => 
            option.setName('trainer')
                .setDescription('Dresseur associé')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('specie')
                .setDescription('Espèce du pokémon sauvage')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('Niveau du pokémon sauvage')
                .setRequired(true)
        ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const [trainer, component] = await setMenuBuilder(
            interaction.user.id, interaction.options.getString('trainer').trim(),
            'winners', 'Pas de vainqueur ?', true
        )
        if (trainer === null) return await interaction.reply({
            content: component,
            ephemeral: true
        });

        const specie = interaction.options.getString('specie').trim();
        const level = interaction.options.getInteger('level');
        const returned = await createCreature(interaction, null, specie, level);
        if (!returned)
            return await interaction.reply({
                content: `Désolé, le pokémon n'existe pas.`,
                ephemeral: true
            });

        Stock.creatureSaved[trainer.id] = returned;

        return await interaction.reply({
            content: `Un ${await returned.getSpecieName()} a été vaincu. Qui l'a battu ?`,
            components: [ component ]
        });
    }
}