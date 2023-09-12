module.exports = {
    emoji: ":tickets:",
    name: "Refund Voucher",
    value: "voucher",
    description: "Instantly gain ten foxes! Rare foxes not included",
    rarity: -1000,
    async onUse(user, getItemScreen) {
        user.foxes ??= {};
        user.foxes.orange = (user.foxes.orange ?? 0) + 10;
        return getItemScreen(user, "You gained **10**:fox:!");
    }
}
