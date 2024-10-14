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
async function rename_type_response(message) {
    const userId = message.author.id;
	const nickname = message.content.trim();
    const trainer = Stock.trainerSaved[userId];
    const creature = Stock.creatureSaved[userId];

    await creature.update({ nickname });
    await message.reply(`Le ${await creature.getSpecieName()} s'appelle désormais ${nickname}.`)

    Stock.creatureSaved[trainer.id] = null;
    Stock.modeSaved[userId] = null;
    Stock.trainerSaved[userId] = null;
}

module.exports = rename_type_response;