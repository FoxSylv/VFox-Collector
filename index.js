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

client.on(Events.InteractionCreate, async interaction => {
    try {
        /* Ensure that it is the right user */
        if (interaction.customId && !interaction.customId?.endsWith(interaction.user.id)) {
            interaction.reply({content: "This is not for you!", ephemeral: true});
            return;
        }

        /* Test if inputs locked (spam prevention) */
        const prev = prevInteractions.get(interaction.user.id);
        if (prev?.isLocked) {
            interaction.reply({content: "You are spamming inputs too fast!", ephemeral: true});
            return;
        }
        prevInteractions.set(interaction.user.id, {interaction: prev?.interaction, timeout: prev?.timeout, isLocked: true}); //Lock inputs
    
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

        
        /* Respond to interaction */
        let useType = "";
        let input = "";
        let commandName = "";
        if (interaction.isChatInputCommand()) {
            /* Special case due to the tutorial follow-ups */
            prevInteractions.set(interaction.user.id, {interaction: interaction, timeout: timeout, isLocked: false});
            client.commands[interaction.commandName]?.execute(interaction);
            return;
        }
        else if (interaction.isModalSubmit()) {
            useType = "modalSubmit";
            input = interaction.fields.fields;
            commandName = interaction.customId.split('.')[0];
        }
        else if (interaction.isButton()) {
            useType = "buttonPress";
            input = interaction.customId;
            commandName = interaction.customId.split('.')[0];
        }
        else if (interaction.isStringSelectMenu()) {
            useType = "stringSelect";
            input = interaction.values;
            commandName = interaction.values[0].split('.')[0];
        }
        else {
            return;
        }

        const user = await getProfile(interaction.user.id);
        const output = await client.commands[commandName]?.[useType](user, input, interaction.customId); //Extra customId is only for modals
        if (output.modal) {
            interaction.showModal(output.modal);
        }
        else {
            if (!output) throw new Error(`Invalid interaction output!\nInteraction: ${interaction}\nInput: ${input}\nOutput: ${output}`);

            /* Add user id to buttons/select menus so only they can interact with them */
            output.components.forEach(row => console.log(row.components.forEach(r => r.data.customId = r.data.customId.concat(`.${interaction.user.id}`))));

            await interaction.reply(output);
        }
        prevInteractions.set(interaction.user.id, {interaction: interaction, timeout: timeout, isLocked: false}); //Unlock inputs
    }
    catch(error) {
        console.error(error);
        prevInteractions.delete(interaction.user.id);
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
