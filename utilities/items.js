const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('../config.json');
const fs = require('node:fs');
const path = require('node:path');

function getItems() {
    const items = {};
    const itemPath = path.join(__dirname, "../items");
    const itemFiles = fs.readdirSync(itemPath).filter(file => file.endsWith('.js'));
	for (const file of itemFiles) {
	    const filePath = path.join(itemPath, file);
    	const item = require(filePath);
		if ('emoji' in item && 'name' in item && 'value' in item && 'description' in item && 'rarity' in item && 'onUse' in item) {
		    items[item.value] = item;
		}
        else {
			console.log(`[WARNING] The item at ${filePath} is missing a required property.`);
		}
	}

    return items;
}

module.exports.items = getItems();
