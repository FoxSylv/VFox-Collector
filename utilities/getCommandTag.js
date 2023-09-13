const commandTags = new Map();
async function initTags(client) {
    try {
        await client.application.commands.fetch();
        client.application.commands.cache.forEach((value, key) => commandTags.set(value.name, key));
    }
    catch (error) {
        console.error(`Something went wrong whil trying to load command tags!\n\n${error}`);
    }
}


/* Formats command name to </NAME:COMMAND_ID>, if possible */
function getCommandTag(name) {
    return commandTags.has(name) ? `</${name}:${commandTags.get(name)}>` : `\`${name}\``;
}

module.exports = {
    initTags,
    getCommandTag
};
