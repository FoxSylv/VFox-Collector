const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const { dbInit } = require('./utilities/db.js');
const getCommands = require('./utilities/getCommands.js');
const { getProfile } = require('./utilities/db.js');

/* Initialization */
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
dbInit();
client.commands = {};
getCommands().forEach(command => client.commands[command.data.name] = command);
const prevInteractions = new Map();

client.on(Events.InteractionCreate, async interaction => {
    try {
        /* Remove components from previous interaction */
        const prev = prevInteractions.get(interaction.user.id);
        clearTimeout(prev?.timeout);
        if (prev?.interaction?.replied) {
            await prev.interaction.editReply({components: []});
        }
        const timeout = setTimeout((prevInteractions, interaction) => {
            prevInteractions.delete(interaction.user.id);
            if (interaction.replied) {
                interaction.editReply({components: []});
            }
        }, 600000, prevInteractions, interaction);
        prevInteractions.set(interaction.user.id, {interaction: interaction, timeout: timeout});

        /* Multi-hit Button Handler */
        if (interaction.isButton()) {
            const commandName = Object.keys(client.commands).find(c => client.commands[c].buttonValues?.includes(interaction.customId));
            if (!commandName) {
                return;
            }
            const command = client.commands[commandName];

            const user = await getProfile(interaction.user.id);
            await interaction.reply(await command.buttonPress(user, interaction.customId));
        }

        /* Multi-Hit String Select Menu Handler */
        if (interaction.isStringSelectMenu()) {
            const commandName = Object.keys(client.commands).find(c => client.commands[c].stringSelectValues?.includes(interaction.values[0]));
            if (!commandName) {
                return;
            }
            const command = client.commands[commandName];

            const user = await getProfile(interaction.user.id);
            await command.stringSelect(interaction, user, interaction.values[0]);
        }

        /* Slash Command Handler */
	    if (interaction.isChatInputCommand()) {
	        const command = client.commands[interaction.commandName];
        	if (!command) {
	    	    console.error(`No command matching ${interaction.commandName} was found.`);
	        	return;
        	}

    		await command.execute(interaction);
        }
    }
    catch(error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'An error occurred while responding to this interaction!', ephemeral: true });
        }
        else {
            await interaction.reply({ content: 'An error occurred while responding to this interaction!', ephemeral: true });
        }
    }
});



/* Log in */
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});
client.login(token);
