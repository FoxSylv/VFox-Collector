const { REST, Routes } = require('discord.js');
const { clientId, devGuildId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');
const getCommands = require('../utilities/getCommands.js');

/* Differentiate commands */
let allCommands = getCommands();
let userCommands = allCommands.filter(com => !com.isDev);
let devCommands = allCommands.filter(com => com.isDev);

/* Deploy via REST module */
const rest = new REST().setToken(token);
(async () => {
	try {
		console.log(`Started refreshing ${allCommands.length} application (/) commands.`);

		const userData = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: userCommands.map(c => c.data.toJSON()) }
		);
        const devData = await rest.put(
            Routes.applicationGuildCommands(clientId, devGuildId),
            { body: devCommands.map(c => c.data.toJSON()) }
        );

		console.log(`Successfully reloaded ${userData.length} user (/) commands and ${devData.length} dev (/) commands.`);
	}
    catch (error) {
		console.error(error);
	}
})();

