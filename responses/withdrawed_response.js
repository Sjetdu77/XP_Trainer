const {
    OmitPartialGroupDMChannel,
    Message
} = require('discord.js');
const { Stock } = require('../datas/stock');

/**
 * 
 * @param {OmitPartialGroupDMChannel<Message<boolean>>} message 
 * @returns 
 */
async function withdrawed_response(message) {
    const userId = message.author.id;
	const content = message.content;
    const trainer = Stock.trainerSaved[userId];

    const allQuotes = content.split(',')
    const creaturesSaved = Stock.creatureSaved[trainer.id];
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

    Stock.creatureSaved[trainer.id] = null;
    Stock.modeSaved[userId] = null;
    Stock.trainerSaved[userId] = null;
}

module.exports = withdrawed_response;