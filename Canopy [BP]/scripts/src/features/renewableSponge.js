import { world } from '@minecraft/server';
import { Rule } from 'lib/canopy/Rule';

new Rule({
    category: 'Rules',
    identifier: 'renewableSponge',
    description: 'Guardians transform into elder guardians when hurt by lightning.',
});

world.afterEvents.entityHurt.subscribe(event => {
    if (event.hurtEntity.typeId !== 'minecraft:guardian' || !Rule.getValue('renewableSponge') || event.damageSource.cause !== 'lightning') 
        return;

    const guardian = event.hurtEntity;
    guardian.dimension.spawnEntity('minecraft:elder_guardian', guardian.location);
    guardian.remove();
});