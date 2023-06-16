const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('../config.json');
const fs = require('node:fs');
const path = require('node:path');
const commandPath = '../commands';

function getCommands() {
    const commands = [];
    const foldersPath = path.join(__dirname, commandPath);
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
    	const commandsPath = path.join(foldersPath, folder);
	    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	    for (const file of commandFiles) {
		    const filePath = path.join(commandsPath, file);
    		const command = require(filePath);
            command.category = folder;
	    	if ('data' in command && 'execute' in command) {
		    	commands.push(command);
		    }
            else {
			    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		    }
	    }
    }

    return commands;
}

module.exports = getCommands;
