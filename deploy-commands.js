const { REST, Routes } = require('discord.js');
const { clientId, devClientId, devGuildId, token, devToken } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');
const getCommands = require('./utilities/getCommands.js');

/* Differentiate commands */
let allCommands = getCommands();
let userCommands = allCommands.filter(com => !com.isDev);
let devCommands = allCommands.filter(com => com.isDev);
const isDev = process.argv.includes("--dev");

/* Deploy via REST module */
const rest = new REST().setToken(isDev ? devToken : token);
(async () => {
	try {
		console.log(`Started refreshing ${allCommands.length} application (/) commands.`);

		const userData = await rest.put(
			Routes.applicationCommands(isDev ? devClientId : clientId),
			{ body: userCommands.map(c => c.data.toJSON()) }
		);
        const devData = isDev ? await rest.put(
            Routes.applicationGuildCommands(isDev ? devClientId : clientId, devGuildId),
            { body: devCommands.map(c => c.data.toJSON()) }
        ) : []; //Only deploy dev commands to the dev bot

		console.log(`Successfully reloaded ${userData.length} user (/) commands and ${devData.length} dev (/) commands.`);
	}
    catch (error) {
		console.error(error);
	}
})();

