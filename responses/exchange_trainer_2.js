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
async function exchange_trainer_2(interaction) {
    const stock = Stocks.getStock(interaction.user.id);
    const creature = stock.team[interaction.values[0]];
    const datas = stock.datas;
    const otherCreature = datas.creature;

    await creature.setTrainer(datas.trainer);
    await otherCreature.setTrainer(stock.chosenTrainer.id);

    return await interaction.update({
        content: `${await getName(creature)} a bien été échangé avec ${await getName(otherCreature)}`,
        components: []
    })
}

module.exports = exchange_trainer_2;