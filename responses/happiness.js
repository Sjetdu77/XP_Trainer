const {
    StringSelectMenuInteraction,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require('discord.js');
const { Stocks } = require('../datas/stock');
const { getName, setAllOptions } = require('../datas/generalFunctions');

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @returns 
 */
async function happiness(interaction) {
    const userId = interaction.user.id;
    const stock = Stocks.getStock(userId);
    const options = await setAllOptions(userId, stock.chosenTrainer);
    if (typeof options === 'string') return await interaction.reply({
        content: options,
        ephemeral: true
    });

    switch (interaction.values[0]) {
        case 'ev': stock.datas = [10, 5, 1, 1]; break;
        case 'vit': stock.datas = [4, 2, 0, 0]; break;
        case 'fea': stock.datas = [2, 1, 0, 0]; break;
        case 'buff': stock.datas = [1, 1, 0, 0]; break;
        case 'ko-': stock.datas = [-1, -1, -1, -1]; break;
        case 'ko+': stock.datas = [-5, -5, -10, -10]; break;
        case 'pow': stock.datas = [-5, -5, -10, -10]; break;
        case 'racn': stock.datas = [-5, -10, -15, -15]; break;
        case 'herb': stock.datas = [-15, -15, -20, -20]; break;
        case 'gym':
            let content = '';
            for (const creature of Object.values(stock.team))
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

module.exports = happiness;