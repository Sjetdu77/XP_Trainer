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
async function withdrawed_response(message) {
    const userId = message.author.id;
    const stock = Stocks.getStock(userId);
	const content = message.content;
    const allQuotes = content.split(',')
    const creaturesSaved = stock.creature;
    const allCreatures = Object.keys(creaturesSaved);
    let s = '';

    for (let quote of allQuotes) {
        quote = quote.trim();
        if (allCreatures.includes(quote)) {
            creaturesSaved[quote].update({ place: 'team' });
            s += `${quote} retiré.\n`
        }
        else {
            s += `${quote} n'existe pas.\n`
        }
    }

    await message.reply(s);
}

module.exports = withdrawed_response;