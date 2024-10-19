const {
    OmitPartialGroupDMChannel,
    Message
} = require('discord.js');
const { Stocks } = require('../datas/stock');

/**
 * 
 * @param {OmitPartialGroupDMChannel<Message<boolean>>} message 
 * @returns 
 */
async function rename_type(message) {
    const userId = message.author.id;
    const stock = Stocks.getStock(userId);
	const nickname = message.content.trim();
    const creature = stock.creature;

    await creature.update({ nickname });
    await message.reply(`Le ${await creature.getSpecieName()} s'appelle désormais ${nickname}.`)

    stock.clear();
}

module.exports = rename_type;