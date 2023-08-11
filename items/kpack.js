module.exports = {
    emoji: ":four_leaf_clover:",
    name: "Blessed Bait Package",
    value: "kpack",
    description: "A very small amount of Blessed Bait",
    rarity: 4.5,
    async onUse(user) {
        user.upgrades ??= {};
        user.upgrades.coin ??= {};
        user.upgrades.coin.bait ??= {};

        const gained = 1 + Math.floor(Math.random() * 3);
        user.upgrades.coin.bait.blessed = (user.upgrades.coin.bait.blessed ?? 0) + gained;
        return `You gained ${gained} Blessed Bait!`;
    }
}
