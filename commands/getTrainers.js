const {
    SlashCommandBuilder,
    ChatInputCommandInteraction
} = require('discord.js');
const { Pokemon_Trainer, Pokemon_Creature } = require('../classes');
const { getName } = require('../datas/generalFunctions');

/**
 * 
 * @param {Object} embed 
 * @param {Object[]} embed.fields
 * @param {Pokemon_Creature[]} table 
 */
async function setDatas(embed, table) {
    for (const creature of table) {
        const rate = await creature.getXPRate() * 100;
        const name = await getName(creature);
        let value = `${await creature.getSpecieName()} niveau ${creature.level}`;
        if (creature.captured !== creature.team) value += ` (échangé)`;
        value += `\nBonheur : ${creature.happiness}\n`;
        value += '`XP: [';
        for (let t = 1; t <= 25; t++) value += rate / 4 >= t ? '|' : ' ';
        value += ']`\n';
        value += `XP restants : ${await creature.getMaxXP() - creature.actualXP}`;

        embed.fields.push({ name, value });
    }
}

/**
 * 
 * @param {Pokemon_Trainer} trainer 
 * @param {Pokemon_Creature[]} creatures
 * @returns 
 */
async function createEmbedModel(trainer, creatures) {
    var embed = {
        'type': 'rich',
        'title': trainer.name,
        'color': 0x530f57,
        'fields': []
    }
    
    const inTeam = [];
    const inPC = [];

    for (const creature of creatures) {
        let stock = [];
        if (creature.place === 'team') stock = inTeam;
        else if (creature.place === 'computer') stock = inTeam;
        stock.push(creature);
    }

    embed.fields.push({ name: `--- Dans l'équipe ---`, value: '' });
    await setDatas(embed, inTeam);

    if (inPC.length > 0) {
        embed.fields.push({ name: `--- Dans le PC ---`, value: '' });
        await setDatas(embed, inPC);
    }

    return embed;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get_trainers')
        .setDescription('Permet d\'obtenir des informations sur les dresseurs d\'un joueur.')
        .addUserOption(option => option.setName('user')
            .setDescription('Joueur dont le dresseur appratient')
            .setRequired(true)
        ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        let datas = await Pokemon_Trainer.findAll({
            where: { userId: interaction.options.getUser('user', true).id },
            include: [Pokemon_Trainer.Team]
        });
        if (datas.length === 0) {
            return await interaction.reply({
                content: `Désolé, mais il n'existe aucun Dresseur.`
            });
        }

        let embeds = [];
        for (const trainer of datas) {
            const allCreatures = await trainer.getCreatures({
                include: [
                    Pokemon_Creature.Specie,
                    Pokemon_Creature.Captured,
                    Pokemon_Creature.Trainer
                ]
            });
            embeds.push(await createEmbedModel(trainer, allCreatures));
        }

        if (embeds.length > 0) {
            await interaction.reply({
                embeds
            });
        } else {
            await interaction.reply({
                content: 'Erreur',
                ephemeral: true
            })
        }
    }
}