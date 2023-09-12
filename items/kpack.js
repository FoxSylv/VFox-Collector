module.exports = {
    emoji: ":four_leaf_clover:",
    name: "Blessed Bait Package",
    value: "kpack",
    description: "A very small amount of Blessed Bait",
    rarity: 5.5,
    weight: 1,
    async onUse(user, getItemScreen) {
        user.upgrades ??= {};
        user.upgrades.coin ??= {};
        user.upgrades.coin.bait ??= {};

        const gained = 1 + Math.floor(Math.random() * 3);
        user.upgrades.coin.bait.blessed = (user.upgrades.coin.bait.blessed ?? 0) + gained;
        return getItemScreen(user, `You found ${gained} Blessed Bait :four_leaf_clover:`);
    }
}
