const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require('discord.js');
const { setAllOptions } = require('../datas/generalFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('change_place')
        .setDescription(`Permet à un pokémon de changer de place entre l'équipe et le PC.`)
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
        const trainer = interaction.options.getString('trainer').trim();
        const userId = interaction.user.id;

        let options = [];
        const [trainerFounded, allTeams] = await setAllOptions(userId, trainer);
        if (typeof allTeams === 'string')
            return await interaction.reply({
                content: allTeams,
                ephemeral: true
            });

        const [_, allPC] = await setAllOptions(userId, trainer, 'computer');
        if (typeof allPC === 'string')
            return await interaction.reply({
                content: allPC,
                ephemeral: true
            });

        
        if (allTeams.length < 6 && allPC.length > 0)
            options.push({
                label: `Retirer`,
                description: `Intégrer dans l'équipe des pokémons pris des boîtes.`,
                value: `withdraw`
            });

        if (allTeams.length > 1)
            options.push({
                label: `Déposer`,
                description: `Déposer des pokémons de l'équipe dans des boîtes.`,
                value: `deposit`
            });

        if (options.length === 0)
            return await interaction.reply({
                content: `Vous n'avez qu'un pokémon.`,
                ephemeral: true
            });

        return await interaction.reply({
            content: `Qu'est-ce que vous voulez faire ?`,
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('place_choices')
                            .setPlaceholder(`Retirer ou déposer ?`)
                            .addOptions(options)
                    )
            ]
        })
    }
}