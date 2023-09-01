module.exports = {
    emoji: ":takeout_box:",
    name: "Fox Mega Box",
    value: "mbox",
    description: "An extreme number of every type of fox",
    rarity: 8.5,
    weight: 6,
    async onUse(user) {
        user.foxes ??= {};
        user.foxes.orange = (user.foxes.kitsune ?? 0) + (10 + Math.floor(Math.random() * 20));
        user.foxes.grey = (user.foxes.kitsune ?? 0) + (5 + Math.floor(Math.random() * 10));
        user.foxes.cryptid = (user.foxes.kitsune ?? 0) + (1 + Math.floor(Math.random() * 2));
        user.foxes.kitsune = (user.foxes.kitsune ?? 0) + (3 + Math.floor(Math.random() * 7));
        return `You got a whole lot of foxes!`;
    }
}
