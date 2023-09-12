module.exports = {
    emoji: ":flags:",
    name: "Doppelganger",
    value: "dopp",
    description: "Copies the effect from the item directly above this one",
    rarity: 4.5,
    weight: 2,
    async onUse(user, getItemScreen, items, slot) {
        const itemVal = user.items[slot - 1];
        let content = "";
        if (itemVal === undefined) {
            content = "You copied an empty slot!";
        }
        else if (itemVal === "ppod") {
            content = "You get a voice in your head mumbling something about infinite recursion";
        }
        else {
            const item = items[itemVal];
            content = getItemScreen(user, `(Copied ${item.emoji} ${item.name}) ${(await item.onUse(user, interaction, items, slot - 1)).content}`);
        }
        return getItemScreen(user, content);
    }
}
