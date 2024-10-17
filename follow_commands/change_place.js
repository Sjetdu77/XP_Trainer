const {
    ChatInputCommandInteraction,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require('discord.js');
const { setAllOptions } = require("../datas/generalFunctions");
const { Stocks } = require("../datas/stock");

/**
 * 
 * @param {ChatInputCommandInteraction} interaction 
 * @returns 
 */
async function change_place(interaction) {
    const userId = interaction.user.id;
    const stock = Stocks.getStock(userId);

    let options = [];
    const allTeams = await setAllOptions(userId, stock.chosenTrainer);
    if (typeof allTeams === 'string') return await interaction.reply({
        content: allTeams,
        ephemeral: true
    });

    const allPC = await setAllOptions(userId, stock.chosenTrainer, 'computer');
    if (typeof allPC === 'string') return await interaction.reply({
        content: allPC,
        ephemeral: true
    });

    
    if (allTeams.length < 6 && allPC.length > 0) options.push({
        label: `Retirer`,
        description: `Intégrer dans l'équipe des pokémons pris des boîtes.`,
        value: `withdraw`
    });

    if (allTeams.length > 1) options.push({
        label: `Déposer`,
        description: `Déposer des pokémons de l'équipe dans des boîtes.`,
        value: `deposit`
    });

    if (options.length === 0) return await interaction.reply({
        content: `Vous n'avez qu'un pokémon.`,
        ephemeral: true
    });

    return await interaction.update({
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

module.exports = change_place;