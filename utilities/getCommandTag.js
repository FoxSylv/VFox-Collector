const commandTags = new Map();
async function initTags(client) {
    await client.application.commands.fetch();
    client.application.commands.cache.forEach((value, key) => commandTags.set(value.name, key));
}


/* Formats command name to </NAME:COMMAND_ID>, if possible */
function getCommandTag(name) {
    return commandTags.has(name) ? `</${name}:${commandTags.get(name)}>` : `\`${name}\``;
}

module.exports = {
    initTags,
    getCommandTag
};
