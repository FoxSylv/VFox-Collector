module.exports = {
    emoji: ":money_with_wings:",
    name: "Government Bribe",
    value: "bribe",
    description: "Sets your orange fox count to zero",
    rarity: -1000,
    async onUse(user, getItemScreen) {
        user.foxes ??= {};
        user.foxes.orange = undefined;
        return getItemScreen(user, "It's best not to ask where the foxes went...");
    }
}
