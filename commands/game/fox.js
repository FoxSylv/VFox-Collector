const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');
const { foxEmoji } = require('../../data/foxEmoji.js');
const { countFoxes } = require('../../utilities/countFoxes.js');


const bonuses = [
    {value: "net", chance: 0.97, minionChance: 0.96, bonuses: [
        {value: "shoddy", chance: 0.98},
        {value: "basic", chance: 0.988, minionChance: 0.968},
        {value: "extendo", chance: 0.991, minionChance: 0.973, foxQuantity: 1, foxQuality: -1},
        {value: "trawling", chance: 0.993, minionChance: 0.98, foxQuantity: 2, foxQuality: -1000, itemQuantity: 2, itemQuality: -2},
        {value: "glitter", chance: 0.95, minionChance: 0.92, foxQuantity: -1, foxQuality: 2, itemQuantity: -2, itemQuality: 2},
        {value: "nine-tailed", chance: 0.999, minionChance: 0.988, foxQuantity: 2, foxQuality: 2, itemQuantity: -1000, kitsune: 0.1}
    ]},
    {value: "pen", bonuses: [
        {value: "cramped", foxQuality: -1},
        {value: "park", foxQuality: 1, itemQuantity: 0.5},
        {value: "pit", foxQuality: -1000, itemQuantity: -1000},
        {value: "apartment", foxQuality: 2, itemQuantity: -0.5},
        {value: "shrine", foxQuantity: 2, foxQuality: 2, itemQuantity: -1000, kitsune: 0.1}
    ]},
    {value: "land", bonuses: [
        {value: "basic", foxQuantity: 1, foxQuality: 0.5, itemQuantity: 0.5},
        {value: "woods", foxQuantity: 1, foxQuality: 2, itemQuantity: 1},
        {value: "forest", foxQuantity: 4, foxQuality: 1, itemQuantity: -1, itemQuality: -1},
        {value: "dump", foxQuantity: -4, foxQuality: -4, itemQuantity: 4, itemQuality: 2},
        {value: "countryside", chance: 0.0001, minionChance: 0.003, foxQuantity: 4, foxQuality: 2, itemQuantity: 2, itemQuality: 1},
        {value: "blessed", chance: 0.00011, minionChance: 0.004, foxQuantity: 4, foxQuality: 4, itemQuantity: -1000, kitsune: 0.25}
    ]},
    {value: "bait", bonuses: [
        {value: "basic", chance: 0.0001, minionChance: 0.0012, foxQuantity: 1},
        {value: "special", chance: 0.00012, minionChance: 0.0011, foxQuantity: 2, foxQuality: 2, itemQuantity: -1},
        {value: "advanced", chance: 0.0002, minionChance: 0.02, foxQuantity: 1, foxQuality: 4, itemQuantity: 2, itemQuantity: 2},
        {value: "blessed", chance: 0.0009, minionChance: 0.005, foxQuantity: 4, foxQuality: 4, itemQuantity: -1000, kitsune: 0.25}
    ]}
];
function getBonus(user, category, bonus) {
    return bonuses.find(c => c.value === category)?.bonuses.find?.(b => b.value === user.equips?.[category])?.[bonus];
}
function getAllBonuses(user, bonus) {
    return bonuses.reduce((acc, cat) => {
        return acc + (getBonus(user, cat, bonus) ?? (cat[bonus] ?? 0));
    }, 0);
}

function canItems(user) {
    return user.upgrades?.coin?.nets?.shoddy === true;
}
function canRareFox(user) {
    return user.upgrades?.coin?.nets?.basic === true;
}
function canKitsune(user) {
    return ((user.upgrades?.coin?.nets?.nine-tailed === true) ||
            (user.upgrades?.coin?.pens?.shrine === true) ||
            (user.upgrades?.coin?.land?.blessed === true));
}

function findFoxes(user, foxCount, isMinion, iterations) {
    const chance = getAllBonuses(user, isMinion ? "minionChance" : "chance") ** foxCount;

    let foxes = new Map();
    for (let i = 0; i < iterations; ++i) {
        if (Math.random() < chance) {
            const quantity = 1 + Math.floor(Math.random() * (getAllBonuses(user, "foxQuantity") * (isMinion ? 0.6 : 1)));
            const quality = 1 + Math.floor(getAllBonuses(user, "foxQuality") * (isMinion ? 0.4 : 1));
            const kitsune = isMinion ? 0 : (1 + getAllBonuses(user, "kitsune"));

            if (kitsune * quality > 9 && canKitsune(user) && canRareFox(user)) {
                foxes.set("kitsune", (foxes.get("kitsune") ?? 0) + quantity);
            }
            else if (quality > 5 && canRareFox(user)) {
                foxes.set("cryptid", (foxes.get("cryptid") ?? 0) + quantity);
            }
            else if (quality > 2 && canRareFox(user)) {
                foxes.set("grey", (foxes.get("grey") ?? 0) + quantity);
            }
            else {
                foxes.set("orange", (foxes.get("orange") ?? 0) + Math.max(1, quantity));
            }
        }
    }

    user.foxes ??= {};
    for (const [type, num] of foxes) {
        user.foxes[type] = (user.foxes[type] ?? 0) + num;
    }

    return foxes;
}


function foxMessage(user, foxes, item) {
    const description = foxEmoji.reduce((acc, type) => {
        const num = foxes.get(type.value);
        if (num) {
            return acc.concat(`**${num}** ${type.emoji}\n`);
        }
        return acc;
    }, "");
    const foxCount = countFoxes(user.foxes);

    const embed = new EmbedBuilder()
        .setColor(0xEA580C)
        .setTitle(user.equips?.net ? `${user.equips.net} -` : "You found:")
        .setDescription(description === "" ? "You found no foxes :(" : description)
        .setFooter({text: `You now have ${foxCount} ${foxCount === 1 ? "fox" : "foxes"}!`});
    return {embeds: [embed]};
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName("fox")
		.setDescription("Go searching for foxes!"),
	async execute(interaction) {
        const user = await getProfile(interaction.user.id);
        const cooldown = user.cooldown;
        const now = Date.now();
        if (now < cooldown) {
            const cooldownLeft = Math.ceil((cooldown - now) / 100) / 10;
            await interaction.reply(`You are still on cooldown for \`${cooldownLeft}${(cooldownLeft === Math.ceil(cooldownLeft) ? `.0` : ``)}\` seconds`);
            return;
        }

        /* Calculate foxes earned */
        const foxCount = countFoxes(user.foxes); /* To prevent repeated recalculation */
        const minionCount = user.upgrades?.shrine?.minionCount ?? 0;
        const userFoxes = findFoxes(user, foxCount, false, 1);
        const minionFoxes = findFoxes(user, foxCount, true, minionCount);
        let totalFoxes = new Map();
        for (const [type, num] of userFoxes) totalFoxes.set(type, num);
        for (const [type, num] of minionFoxes) totalFoxes.set(type, (totalFoxes.get(type) ?? 0) + num);

        /* Calculate items earned */
        let item = undefined;
        if (canItems(user)) {
            //TODO: ITEMS
        }

        await user.save();
        await interaction.reply(foxMessage(user, totalFoxes, item));
	}
};

