const https = require('node:https');
const { clientId, token } = require('../config.json'); 
const options = {
    host: "https://discord.com",
    path: `/api/v10/applications/${clientId}/commands`,
    headers: {"Authorization": `Bot ${token}`}
};


function getCommandTag(name) {
    https.get(options, (res) => {
        let data = "";
        console.log(res);
        res.on("data", chunk => data = data.concat(chunk));
        res.on("end", () => {
            //TODO This is broken and needs work. I just don't know how
        });
    }).on('error', (e) => {
        console.error(e);
    });
    return `\`${name}\``;
}

module.exports = {
    getCommandTag
};
