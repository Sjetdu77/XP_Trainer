const { SlashCommandBuilder,
    ChatInputCommandInteraction,
} = require('discord.js');
const { Pokemon_Trainer, Pokemon_Creature, Pokemon_Specie } = require('../classes');

/**
 * 
 * @param {Pokemon_Trainer} trainer 
 * @param {Pokemon_Creature[]} creatures 
 * @param {Pokemon_Specie[]} species 
 * @returns 
 */
async function createEmbedModel(trainer, creatures, species) {
    var embed = {
        'type': 'rich',
        'title': trainer.name,
        'color': 0x530f57,
        'fields': []
    }
    
    const inTeam = [];
    const inPC = [];

    for (let i = 0; i < creatures.length; i++) {
        const creature = creatures[i];
        (creature.place === 'team' ? inTeam : inPC).push([creature, species[i]]);
    }

    embed.fields.push({ name: `--- Dans l'équipe ---`, value: '' });
    for (const [creature, specie] of inTeam) {
        const rate = await creature.getXPRate() * 100;

        let name = `${creature.nickname ? creature.nickname : specie.name}`;
        let value = `${specie.name} niveau ${creature.level}\n`;
        value += `Bonheur : ${creature.happiness}\n`;
        value += '`XP: [';
        for (let t = 1; t <= 50; t++) {
            if (rate / 2 >= t) {
                value += '|';
            } else {
                value += ' ';
            }
        }
        value += ']`';

        embed.fields.push({
            name,
            value
        });
    }

    embed.fields.push({ name: `--- Dans le PC ---`, value: '' });
    for (const [creature, specie] of inPC) {
        const rate = await creature.getXPRate() * 100;

        let name = creature.nickname ? creature.nickname : specie.name;
        let value = `${specie.name} niveau ${creature.level}\n`;
        value += `Bonheur : ${creature.happiness}\n`;
        value += '`XP: [';
        for (let t = 1; t <= 50; t++) {
            if (rate / 2 >= t) {
                value += '|';
            } else {
                value += ' ';
            }
        }
        value += ']`';

        embed.fields.push({
            name,
            value
        });
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
        let options = interaction.options;
        let user = options.getUser('user');
        if (!user) {
            await interaction.reply({
                ephemeral: true,
                content: `Nous avons besoin d'un joueur.`
            });
            return;
        }

        let datas = await Pokemon_Trainer.findAll({
            where: { username: `${user.username}#${user.discriminator}` },
            include: [Pokemon_Trainer.Team]
        });
        if (datas.length === 0) {
            return await interaction.reply({
                content: `Désolé, mais il n'existe aucun Dresseur.`
            });
        }

        let embeds = [];
        for (const trainer of datas) {
            const allCreatures = await trainer.getCreatures();
            const allSpecies = [];
            for (const creature of allCreatures) {
                allSpecies.push(await creature.getSpecie());
            }
            embeds.push(await createEmbedModel(trainer, allCreatures, allSpecies));
        }

        if (embeds.length > 0) {
            await interaction.reply({
                embeds
            });
        } else {
            await interaction.reply({
                content: 'Erreur'
            })
        }
        
    }
}