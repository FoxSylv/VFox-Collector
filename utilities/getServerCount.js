let client;
function initServerCount(clientInit) {
    client = clientInit;
}

function getServerCount() {
    return client?.guilds?.cache?.size ?? "[Uninitialized]";
}

module.exports = {
    initServerCount,
    getServerCount
};
