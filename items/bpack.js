module.exports = {
    emoji: ":carrot:",
    name: "Basic Bait Package",
    value: "bpack",
    description: "A small amount of Basic Bait",
    rarity: 0,
    weight: 1,
    async onUse(user, getItemScreen) {
        user.upgrades ??= {};
        user.upgrades.coin ??= {};
        user.upgrades.coin.bait ??= {};

        const gained = 9 + Math.floor(Math.random() * 11);
        user.upgrades.coin.bait.basic = (user.upgrades.coin.bait.basic ?? 0) + gained;
        return getItemScreen(user, `You found **${gained}** Basic Bait :carrot:`);
    }
}
