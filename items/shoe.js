module.exports = {
    emoji: ":athletic_shoe:",
    name: "Old Shoe",
    value: "shoe",
    description: "JUNK! Might as well use it to free up a slot",
    rarity: 0,
    async onUse(user) {
        return "Good riddance!";        
    }
}
