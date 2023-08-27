module.exports = {
    emoji: ":carrot:",
    name: "Basic Bait Package",
    value: "bpack",
    description: "A small amount of Basic Bait",
    rarity: 0,
    async onUse(user) {
        user.upgrades ??= {};
        user.upgrades.coin ??= {};
        user.upgrades.coin.bait ??= {};

        const gained = 5 + Math.floor(Math.random() * 6);
        user.upgrades.coin.bait.basic = (user.upgrades.coin.bait.basic ?? 0) + gained;
        return `You gained ${gained} Basic Bait!`;
    }
}
