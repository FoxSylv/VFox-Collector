module.exports = {
    emoji: ":sweet_potato:",
    name: "Advanced Bait Package",
    value: "apack",
    description: "A small amount of Advanced Bait",
    rarity: 3.5,
    weight: 1,
    async onUse(user, getItemScreen) {
        user.upgrades ??= {};
        user.upgrades.coin ??= {};
        user.upgrades.coin.bait ??= {};

        const gained = 7 + Math.floor(Math.random() * 8);
        user.upgrades.coin.bait.advanced = (user.upgrades.coin.bait.advanced ?? 0) + gained;
        return getItemScreen(user, `You found **${gained}** Advanced Bait :sweet_potato:`);
    }
}
