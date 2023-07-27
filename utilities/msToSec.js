function msToSec(ms) {
    const sec = Math.ceil(ms / 100) / 10;
    return `${sec}${sec === Math.ceil(sec) ? ".0" : ""}s`;
}

module.exports = {msToSec};
