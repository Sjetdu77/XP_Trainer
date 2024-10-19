const {
    StringSelectMenuInteraction
} = require('discord.js');
const { Stocks } = require('../datas/stock');
const { setMenuBuilder } = require('../datas/generalFunctions');

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @returns 
 */
async function exchange_trainer_1(interaction) {
    const userId = interaction.user.id;
    const stock = Stocks.getStock(userId);
    const otherTrainer = stock.chosenTrainer;
    const datas = stock.datas;
    const otherUserId = datas.otherUser;
    const otherStock = Stocks.getStock(otherUserId);

    otherStock.chosenTrainer = otherTrainer;
    otherStock.datas = {
        trainer: datas.trainer,
        creature: stock.team[interaction.values[0]]
    }

    const component = await setMenuBuilder(
        otherUserId, otherTrainer,
        'exchange_trainer_2', "Qui à échanger ?"
    );
    if (typeof component === 'string') return await interaction.reply({
        content: component,
        ephemeral: true
    });

    if (userId !== otherUserId) stock.clear();

    return await interaction.update({
        content: `<@${otherUserId}>, choisissez un pokémon à échanger.`,
        components: [ component ]
    });
}

module.exports = exchange_trainer_1;