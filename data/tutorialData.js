const { getCommandTag } = require('../utilities/getCommandTag.js');

const tutorialData = {
    start: {title: "Start", tutorial: `Welcome to VFox!\n
In this game, the goal is to collect as many foxes as possible. The twist is that the more foxes you have, the harder they are to find!
Luckily, you can forfeit foxes at the ///shrine to gain upgrades! Or you can ///sell them for coins to use at the ///shop for better equipment
Either way, the choice is yours! Good luck hunting!\n
(You can see this tutorial again plus any others you have seen in the ///tutorials screen)`},
    items: {title: "Items", tutorial: `Congratulations! You just got your first item\n
///items give small boosts to your fox-finding capabilties
Some give temporary effects that can last until you next find an item or beyond!\n
(You can view all active effects in your ///equips screen)`},
    hourglass: {title: "Hourglass", tutorial: `Uh oh! You didn't find anything on your hunt!
Don't worry, though! The fluffy deities shrine brightly on such misfortune\n
When you fail to find anything, the hourglass slowly fills
The amount it fills is proportional to your fox-finding chance
When the hourglass reaches 100%, you get a free orange fox!\n
You can see your current hourglass progress in your ///pen`},
    bait: {title: "Bait", tutorial: `Congratulations! You just got your first bait\n
Bait further improves your stats while hunting, but you only have a small amount of it!
There is a small chance to conserve bait if you don't find foxes, though\n
You can equip and unequip bait in the ///bait screen, or through the ///shop in the purchase menu`},
    shrine: {title: "Shrine", tutorial: `Congratulations! You have enough foxes for your first ///shrine upgrade!
Shrine upgrades are infinitely upgradable, although the effectiveness slowly degrades at higher levels\n
When you ///sell to get permanent equipment, you will lose your shrine upgrades
It is a worthwhile trade, though!`},
    coins: {title: "Coins", tutorial: `Congratulations! You just got 100 foxes at once!
You can now ///sell them to get coins\n
Coins are used in the ///shop to acquire better fox-finding gear
You can equip and unequip gear in its purchase menu after you have it acquired
You can view everything that you are currently using in the ///equips screen`},
   rarefox: {title: "Rare Foxes", tutorial: `Congratulations! You just got your first rare fox\n
When you ///sell, rare foxes are valued higher than normal foxes
Rare foxes aren't worth more at the ///shrine, however
You can view the breakdown of your foxes in your ///shrine`}
};

function initTutorialCommandTags(commandNames) {
    Object.keys(tutorialData).forEach(tutorialName => {
        commandNames.forEach(commandName => {
            tutorialData[tutorialName].tutorial = tutorialData[tutorialName].tutorial.replaceAll(`///${commandName}`, getCommandTag(commandName))
        });
    });
}

module.exports = {
    initTutorialCommandTags,
    tutorialData
};
