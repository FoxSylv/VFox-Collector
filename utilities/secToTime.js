function secToTime(time) {
    const seconds = Math.floor(time);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    return `${days}d${hours - (24 * days)}h${minutes - (60 * hours)}m${seconds - (60 * minutes)}s`;
}

module.exports = {secToTime};
