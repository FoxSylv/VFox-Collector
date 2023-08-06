module.exports = {
    emoji: ":takeout_box:",
    name: "Kitsune Mega Box",
    value: "mbox",
    description: "An extreme number of kitsunes",
    rarity: 9,
    async onUse(user) {
        const num = 3 + Math.floor(Math.random() * 7);
        user.foxes ??= {};
        user.foxes.kitsune = (user.foxes.kitsune ?? 0) + num;
        return `You got **${num}** :shinto_shrine:!`;
    }
}
