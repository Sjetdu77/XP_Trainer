const { Op } = require('sequelize');
const Pokemon_Creature = require('./class/Pokemon_Creature');
const Pokemon_Specie = require('./class/Pokemon_Specie');
const Pokemon_Trainer = require('./class/Pokemon_Trainer');
const Specie_Evolution = require('./class/Specie_Evolution');

Pokemon_Trainer.Team = Pokemon_Trainer.hasMany(Pokemon_Creature, { foreignKey: { allowNull: true, name: 'team' } });
Pokemon_Creature.Trainer = Pokemon_Creature.belongsTo(Pokemon_Trainer, { foreignKey: { allowNull: true, name: 'team' } });

Pokemon_Trainer.Captured = Pokemon_Trainer.hasMany(Pokemon_Creature, { foreignKey: { allowNull: true, name: 'captured' } });
Pokemon_Creature.Captured = Pokemon_Creature.belongsTo(Pokemon_Trainer, { foreignKey: { allowNull: true, name: 'captured' } });

Pokemon_Specie.Creatures = Pokemon_Specie.hasMany(Pokemon_Creature, { foreignKey: { allowNull: true } });
Pokemon_Creature.Specie = Pokemon_Creature.belongsTo(Pokemon_Specie, { foreignKey: { allowNull: true } });

Pokemon_Specie.Evolution = Pokemon_Specie.belongsToMany(Pokemon_Specie, { as: 'evolutions', through: Specie_Evolution });

async function synchronize(restart = false) {
    await Pokemon_Specie.sync();
    await Pokemon_Creature.sync();
    await Pokemon_Trainer.sync();
    await Specie_Evolution.sync();

    if (!restart) {
        await Pokemon_Creature.destroy({ where: {
            [Op.or]: [
                { team: null },
                { place: 'wild' },
                { specieId: null },
            ]
        }});
    
        const allTrainers = await Pokemon_Trainer.findAll();
        for (const trainer of allTrainers) {
            const creatures = await trainer.getCreatures();
            if (creatures.length === 0) {
                trainer.destroy();
            }
        }
    }
}

module.exports = {
    Pokemon_Specie,
    Pokemon_Trainer,
    Pokemon_Creature,
    Specie_Evolution,
    synchronize
};