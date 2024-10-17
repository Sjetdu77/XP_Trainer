const {
    StringSelectMenuInteraction
} = require('discord.js');
const { Stocks } = require('../datas/stock');
const { getName } = require('../datas/generalFunctions');

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 */
async function winners_response(interaction) {
    const userId = interaction.user.id;
    const stock = Stocks.getStock(userId);
    let content = ``;

    for (const [id, creature] of Object.entries(stock.team)) {
        const gains = await creature.gainXPViaFoe(stock.creature, interaction.values.includes(id));
        const name = await getName(creature);
        content += `${name} gagne ${gains[0]} points d'expérience.\n`;
        if (gains[1] > 0) content += `${name} gagne ${gains[1]} niveau${gains[1] > 1 ? 'x' : ''}.\n`
        content += '\n';
    }

    await interaction.update({
        content,
        components: []
    });
    
    stock.clear();
}

module.exports = winners_response;