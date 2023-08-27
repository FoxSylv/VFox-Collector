module.exports = {
    emoji: ":apple:",
    name: "Mega Bait Package",
    value: "mpack",
    description: "A large amount of every bait",
    rarity: 7.5,
    async onUse(user) {
        user.upgrades ??= {};
        user.upgrades.coin ??= {};
        user.upgrades.coin.bait ??= {};

        user.upgrades.coin.bait.basic = (user.upgrades.coin.bait.basic ?? 0) + (13 + Math.floor(Math.random() * 20));
        user.upgrades.coin.bait.special = (user.upgrades.coin.bait.special ?? 0) + (6 + Math.floor(Math.random() * 20));
        user.upgrades.coin.bait.advanced = (user.upgrades.coin.bait.advanced ?? 0) + (6 + Math.floor(Math.random() * 15));
        user.upgrades.coin.bait.blessed = (user.upgrades.coin.bait.blessed ?? 0) + (3 + Math.floor(Math.random() * 6));
        return `You gained a lot of bait!`;
    }
}
