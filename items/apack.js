module.exports = {
    emoji: ":sweet_potato:",
    name: "Advanced Bait Package",
    value: "apack",
    description: "A small amount of Advanced Bait",
    rarity: 3.5,
    async onUse(user) {
        user.upgrades ??= {};
        user.upgrades.coin ??= {};
        user.upgrades.coin.bait ??= {};

        const gained = 4 + Math.floor(Math.random() * 4);
        user.upgrades.coin.bait.advanced = (user.upgrades.coin.bait.advanced ?? 0) + gained;
        return `You gained ${gained} Advanced Bait!`;
    }
}
