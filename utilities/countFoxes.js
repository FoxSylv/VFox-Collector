const { foxData } = require('../data/foxData.js');

function countFoxes(foxList, isWeighted) {
    const foxes = foxList ?? {};
    return foxData.reduce((acc, f) => {
        return acc + ((foxes[f.value] ?? foxes[f.dbvalue] ?? 0) * (isWeighted ? f.weight : 1));
    }, 0);
}

module.exports = {countFoxes};
