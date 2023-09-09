const { Client, Events, GatewayIntentBits, ActivityType } = require('discord.js');
const { token, devToken } = require('./config.json');
const { dbInit } = require('./utilities/db.js');
const getCommands = require('./utilities/getCommands.js');
const { getProfile } = require('./utilities/db.js');
const { initTags } = require('./utilities/getCommandTag.js');
const { initTutorialCommandTags } = require('./data/tutorialData.js');

/* Initialization */
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
dbInit();
client.commands = {};
getCommands().forEach(command => client.commands[command.data.name] = command);
const prevInteractions = new Map();


/* Lock handling */
function lock(id) {
    const prev = prevInteractions.get(id);
    prevInteractions.set(id, {interaction: prev?.interaction, timeout: prev?.timeout, isLocked: true});
}
function unlock(id) {
    const prev = prevInteractions.get(id);
    prevInteractions.set(id, {interaction: prev?.interaction, timeout: prev?.timeout, isLocked: false});
}

client.on(Events.InteractionCreate, async interaction => {
    try {
        /* Test for spam */
        const prev = prevInteractions.get(interaction.user.id);
        if (prev?.isLocked) {
            interaction.reply({content: "You are spamming inputs too fast!", ephemeral: true});
            return;
        }
        lock(interaction.user.id);
    
        /* Clear previous interaction's components */
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
        prevInteractions.set(interaction.user.id, {interaction: interaction, timeout: timeout, isLocked: true});


        /* Multi-hit Button Handler */
        if (interaction.isButton()) {
            const commandName = Object.keys(client.commands).find(c => client.commands[c].buttonValues?.includes(interaction.customId));
            if (!commandName) {
                return;
            }
            const command = client.commands[commandName];

            const user = await getProfile(interaction.user.id);
            unlock(interaction.user.id);
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
            unlock(interaction.user.id);
            await command.stringSelect(interaction, user, interaction.values[0]);
        }

        /* Slash Command Handler */
	    if (interaction.isChatInputCommand()) {
	        const command = client.commands[interaction.commandName];
        	if (!command) {
	    	    console.error(`No command matching ${interaction.commandName} was found.`);
	        	return;
        	}

            unlock(interaction.user.id);
    		await command.execute(interaction);
        }
    }
    catch(error) {
        console.error(error);
        unlock(interaction.user.id);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'An error occurred while responding to this interaction!', ephemeral: true });
        }
        else {
            await interaction.reply({ content: 'An error occurred while responding to this interaction!', ephemeral: true });
        }
    }        
});



/* Log in */
client.once(Events.ClientReady, async c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
    client.user.setActivity("/fox", { type: ActivityType.Playing });
    await initTags(client);
    initTutorialCommandTags(Object.keys(client.commands));
});
client.login(process.argv.includes("--dev") ? devToken : token);
