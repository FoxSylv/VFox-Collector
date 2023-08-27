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

        const gained = 7 + Math.floor(Math.random() * 8);
        user.upgrades.coin.bait.special = (user.upgrades.coin.bait.special ?? 0) + gained;
        return `You gained ${gained} Special Bait!`;
    }
}
