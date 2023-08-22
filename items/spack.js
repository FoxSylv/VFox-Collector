module.exports = {
    emoji: ":strawberry:",
    name: "Special Bait Package",
    value: "spack",
    description: "A small amount of Special Bait",
    rarity: 1.5,
    async onUse(user) {
        user.upgrades ??= {};
        user.upgrades.coin ??= {};
        user.upgrades.coin.bait ??= {};

        const gained = 14 + Math.floor(Math.random() * 13);
        user.upgrades.coin.bait.special = (user.upgrades.coin.bait.special ?? 0) + gained;
        return `You gained ${gained} Special Bait!`;
    }
}
