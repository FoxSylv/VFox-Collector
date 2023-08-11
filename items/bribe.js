module.exports = {
    emoji: ":money_with_wings:",
    name: "Government Bribe",
    value: "bribe",
    description: "Sets your fox count to zero",
    rarity: -1000,
    async onUse(user) {
        user.foxes = {};
        return "It's best not to ask where the foxes went...";
    }
}
