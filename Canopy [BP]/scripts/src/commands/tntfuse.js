import { system, world } from '@minecraft/server'
import { Rule, Command } from 'lib/canopy/Canopy'

const MAX_FUSE_TICKS = 72000;

new Rule({
    identifier: 'commandTntFuse',
    description: 'Allow the use of the fuse time for primed TNT.'
});

world.afterEvents.entitySpawn.subscribe(event => {
    if (event.entity.typeId !== 'minecraft:tnt') return;
    const fuseTimeProperty = world.getDynamicProperty('tntFuseTime');
    let fuseTime = 80;
    if (fuseTimeProperty !== undefined && Rule.getValue('commandTntFuse'))
        fuseTime = fuseTimeProperty;
    
    if (fuseTime === 80) {
        event.entity.triggerEvent('canopy:normalFuse');
    } else {
        event.entity.triggerEvent('canopy:longFuse');
        system.runTimeout(() => {
            event.entity.triggerEvent('canopy:explode');
        }, fuseTime);
    }
});

const cmd = new Command({
    name: 'tntfuse',
    description: 'Set the fuse time for primed TNT.',
    usage: 'tntfuse <ticks/reset>',
    args: [
        { type: 'number|string', name: 'ticks' }
    ],
    callback: tntfuseCommand,
    contingentRules: ['commandTntFuse']
});

function tntfuseCommand(sender, args) {
    let { ticks } = args;
    if (ticks === null) {
        return cmd.sendUsage(sender);
    } else if (ticks === 'reset') {
        ticks = 80;
        sender.sendMessage('§7Reset TNT fuse time to §a80§7 ticks.');
    } else if (ticks < 0 || ticks > MAX_FUSE_TICKS)
        return sender.sendMessage(`§cInvalid fuse time: ${ticks} ticks. Must be between 0 and ${MAX_FUSE_TICKS} seconds.`);
    else {
        sender.sendMessage(`§7TNT fuse time set to §a${ticks}§7 ticks.`);
    }
    world.setDynamicProperty('tntFuseTime', ticks);
}
