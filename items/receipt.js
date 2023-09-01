module.exports = {
    emoji: ":page_with_curl:",
    name: "Receipt",
    value: "receipt",
    description: "JUNK! Might as well use it to free up a slot",
    rarity: -1,
    weight: 1,
    async onUse(user) {
        return "Good riddance!";
    }
}
