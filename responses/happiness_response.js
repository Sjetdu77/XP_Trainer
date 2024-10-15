const {
    StringSelectMenuInteraction,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require('discord.js');
const { Stock } = require('../datas/stock');
const { getName, setAllOptions } = require('../datas/generalFunctions');

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @returns 
 */
async function happiness_response(interaction) {
    const userId = interaction.user.id;
    const selected = interaction.values[0];
    const [trainer, options] = await setAllOptions(userId, Stock.trainerSaved[userId].name);
    if (typeof options === 'string') return await interaction.reply({
        content: options,
        ephemeral: true
    });

    switch (selected) {
        case 'ev': Stock.numberSaved[trainer.id] = [10, 5, 1, 1]; break;
        case 'vit': Stock.numberSaved[trainer.id] = [4, 2, 0, 0]; break;
        case 'fea': Stock.numberSaved[trainer.id] = [2, 1, 0, 0]; break;
        case 'buff': Stock.numberSaved[trainer.id] = [1, 1, 0, 0]; break;
        case 'ko-': Stock.numberSaved[trainer.id] = [-1, -1, -1, -1]; break;
        case 'ko+': Stock.numberSaved[trainer.id] = [-5, -5, -10, -10]; break;
        case 'pow': Stock.numberSaved[trainer.id] = [-5, -5, -10, -10]; break;
        case 'racn': Stock.numberSaved[trainer.id] = [-5, -10, -15, -15]; break;
        case 'herb': Stock.numberSaved[trainer.id] = [-15, -15, -20, -20]; break;
        case 'gym':
            let content = '';
            for (const creature of Object.values(Stock.teamSaved[trainer.id]))
                content += `${await getName(creature)} a maintenant ${creature.changeHappiness([5, 3, 0, 0])} points de bonheur.\n`;
            
            return await interaction.update({ content, components: [] });
    }

    return await interaction.update({
        content: `Qui a le droit à ce changement de bonheur ?`,
        components: [
            new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`set_happiness`)
                    .setPlaceholder(`Qui est plus/moins heureux ?`)
                    .setOptions(options)
            )
        ]
    })
}

module.exports = happiness_response;