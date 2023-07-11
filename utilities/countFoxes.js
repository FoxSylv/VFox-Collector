function countFoxes(foxList, isWeighted) {
    const foxes = foxList ?? {};
    let total = 0;

    total += (foxes.orange ?? foxes.o ?? 0);
    total += (foxes.grey ?? foxes.g ?? 0) * (isWeighted ? 2 : 1);
    total += (foxes.cryptid ?? foxes.c ?? 0) * (isWeighted ? 5 : 1);
    total += (foxes.kitsune ?? foxes.k ?? 0) * (isWeighted ? 9 : 1);

    return total;
}

module.exports = {countFoxes};
