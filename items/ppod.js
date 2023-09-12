module.exports = {
    emoji: ":flags:",
    name: "Doppelganger",
    value: "ppod",
    description: "Copies the effect from the item directly below this one",
    rarity: 4.5,
    weight: 2,
    async onUse(user, getItemScreen, items, slot) {
        const itemVal = user.items[slot + 1];
        let content = "";
        if (itemVal === undefined) {
            content = "You copied an empty slot!";
        }
        else if (itemVal === "dopp") {
            content = "You get a voice in your head mumbling something about infinite recursion";
        }
        else {
            const item = items[itemVal];
            content = `(Copied ${item.emoji} ${item.name}) ${(await item.onUse(user, getItemScreen, items, slot + 1)).content}`;
        }
        return getItemScreen(user, content);
    }
}
