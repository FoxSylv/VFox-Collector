const shopData = [
    {name: "Net Catalogue", value: "nets", emoji: "🪤", description: "Catch foxes better!", upgrades: [
        {name: "Shoddy Net", value: "shoddy", price: 1, flavor: "It beats using your hands", chance: 0.2, extra: "Allows you to find items, even if this net is not equipped"},
        {name: "Basic Net", value: "basic", price: 2, flavor: "Positively mediocre", chance: 0.4, extra: "Allows you to find rare foxes, even if this net is not equipped"},
        {name: "Extendo-Net", value: "extendo", price: 4, flavor: "Pros: Long range. Cons: Heavy", chance: 0.5, foxQuantity: 1, foxQuality: -1},
        {name: "Trawling Net", value: "trawling", price: 6, flavor: "Aren't these made for fishing?", chance: 0.6, foxQuantity: 2, foxQuality: -1000, itemQuantity: 2, itemQuality: -2},
        {name: "Glitter Net", value: "glitter", price: 7, flavor: "Made of pure(ish) gold", chance: 0.1, foxQuantity: -1, foxQuality: 2, itemQuantity: -2, itemQuality: 2}, 
        {name: "Nine-tailed Net", value: "nine-tailed", price: 9, flavor: "Don't think too hard about it", chance: 0.9, foxQuantity: 2, foxQuality: 2, itemQuantity: -1000, kitsune: 1}
    ]}, 
    {name: "Pen Catalogue", value: "pens", emoji: "🥅",description: "Store foxes better!", cooldown: 5200, max: 60, penalty: 300, upgrades: [
        {name: "Basic Pen", value: "basic", price: 1, flavor: "Where were you keeping them before?", cooldown: 4200, max: 120, penalty: 200},
        {name: "Cramped Pen", value: "cramped", price: 3, flavor: "Don't call PETA", cooldown: 5600, max: 250, penalty: 150, foxQuality: -1},
        {name: "Fox Park", value: "park", price: 3, flavor: "Go away, children!", cooldown: 7400, max: 150, penalty: 250, foxQuality: 1, itemQuantity: 0.5},
        {name: "Fox Pit", value: "pit", price: 5, flavor: "Definitely don't call PETA", cooldown: 18200, max: 500, penalty: 100, foxQuality: -1000, itemQuantity: -1000},
        {name: "Luxury Apartments", value: "apartment", price: 6, flavor: "Utilities included", cooldown: 34600, max: 200, penalty: 200, foxQuality: 2, itemQuantity: -0.5},
        {name: "Nine-tailed Shrine", value: "shrine", price: 9, flavor: "I've been here before!", cooldown: 9000, penalty: 900, foxQuantity: 2, foxQuality: 2, itemQuantity: -1000, kitsune: 1, extra: "The maximum capacity is the average price in foxes of the shrine upgrades"}
    ]}, 
    {name: "Land Catalogue", value: "land", emoji: "🌲", description: "Find better foxes!", upgrades: [
        {name: "Basic Land", value: "basic", price: 1, flavor: "I can see my house from here!", foxQuantity: 1, foxQuality: 0.5, itemQuantity: 0.5},
        {name: "Small Woods", value: "woods", price: 3, flavor: "There are a lot of foxes here", chance: 0.01, foxQuantity: 1, foxQuality: 2, itemQuantity: 1}, 
        {name: "Quaint Forest", value: "forest", price: 5, flavor: "Hasn't been touched in centuries", chance: 0.04, foxQuantity: 4, foxQuality: 1, itemQuantity: -1, itemQuality: -1},
        {name: "Garbage Dump", value: "dump", price: 5, flavor: "You paid how much??", foxQuantity: -4, foxQuality: -4, itemQuantity: 4, itemQuality: 2}, 
        {name: "Abundant Countryside", value: "countryside", price: 8, flavor: "There are way too many foxes here", chance: 0.07, foxQuantity: 4, foxQuality: 2, itemQuantity: 2, itemQuality: 1}, 
        {name: "Blessed Land", value: "blessed", price: 9, flavor: "Nine-tailed Land", chance: 0.09, foxQuantity: 4, foxQuality: 4, itemQuantity: -1000, kitsune: 2}
    ]}, 
    {name: "Bait Catalogue", value: "bait", emoji: "🍎", description: "Lure even more foxes with temporary bait!", upgrades: [
        {name: "Basic Bait", value: "basic", price: 2, quantity: 100, flavor: "C'mere foxy foxy foxy", chance: 0.1, foxQuantity: 1}, 
        {name: "Special Bait", value: "special", price: 4, quantity: 200, flavor: "Special bait for special foxes!", chance: 0.15, foxQuantity: 2, foxQuality: 2, itemQuantity: -1},
        {name: "Advanced Bait", value: "advanced", price: 7, quantity: 50, flavor: "Hand-crafted with love", chance: 0.3, foxQuantity: 1, foxQuality: 4, itemQuantity: 2, itemQuantity: 2}, 
        {name: "Blessed Bait", value: "blessed", price: 9, quantity: 9, flavor: "Use sparingly", chance: 0.9, foxQuantity: 4, foxQuality: 4, itemQuantity: -1000, kitsune: 2}
    ]},
    {name: "Item Catalogue", value: "items", emoji: "📦", description: "Get one-time use items!", upgrades: [
        {name: "Refund Voucher", value: "voucher", price: 1, quantity: 1, flavor: "This is a terrible deal", extra: "Instantly gain ten foxes!\nRare foxes not included"},
        {name: "Government Bribe", value: "bribe", price: 1, quantity: 1, flavor: "It's only illegal if you get caught", extra: "Sets your fox count to zero while preserving shrine upgrades\nYou do not gain any coins from this"},
        {name: "Shrine Donation", value: "donation", price: 9, quantity: 1, flavor: "Take-a-fox Leave-a-fox", extra: "Preserves shrine upgrades next time you sell foxes\nThis is the only way to get coins while maintaining shrine upgrades"}
    ]}
];

module.exports = {shopData};
