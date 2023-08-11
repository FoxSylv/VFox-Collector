module.exports = {
    emoji: ":spider_web:",
    name: "Barbed Wire",
    value: "wire",
    description: "DANGEROUS! Only found with abysmal item quality",
    rarity: -7,
    async onUse(user) {
        let foxes = user.foxes ?? {};
        for (key in Object.keys(foxes)) {
            foxes[key] -= Math.floor(Math.random() * 10);
            foxes[key] = Math.max(foxes[key], 0);
        }
        return "Ouch! You lost some foxes!";
    }
}
