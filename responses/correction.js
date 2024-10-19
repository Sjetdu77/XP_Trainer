const {
    StringSelectMenuInteraction
} = require('discord.js');
const { Stocks } = require('../datas/stock');
const { getName } = require('../datas/generalFunctions');

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @returns 
 */
async function correction(interaction) {
    const userId = interaction.user.id;
    const stock = Stocks.getStock(userId);

    var content = '';
    for (const [id, creature] of Object.entries(stock.team)) {
        if (interaction.values.includes(id)) {
            const name = await getName(creature);
            const loses = await creature.minusXPViaFoe(stock.creature);
            const lvlLost = loses[1];
            content += `${name} perd ${loses[0]} points d'expérience.\n`;
            if (lvlLost > 0) content += `${name} perd ${lvlLost} niveau${lvlLost > 1 ? 'x' : ''}.\n`;
            content += '\n';
        }
    }

    await interaction.update({
        content,
        components: []
    });

    stock.clear();
}

module.exports = correction;