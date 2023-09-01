module.exports = {
    emoji: ":flags:",
    name: "Doppelganger",
    value: "ppod",
    description: "Copies the effect from the item directly below this one",
    rarity: 4.5,
    weight: 2,
    async onUse(user, interaction, items, slot) {
        const itemVal = user.items[slot + 1];
        if (itemVal === undefined) {
            return "You copied an empty slot!";
        }
        else if (itemVal === "dopp") {
            return "You get a voice in your head mumbling something about infinite recursion";
        }
        const item = items[itemVal];
        return `(Copied ${item.emoji} ${item.name}) ${await item.onUse(user, interaction, items, slot + 1)}`;
    }
}
