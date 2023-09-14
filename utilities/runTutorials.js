const { tutorialData } = require('../data/tutorialData.js');

async function runTutorial(user, interaction, tutorial, condition) {
    if (!user.tutorials?.[tutorial] && condition) {
        user.tutorials ??= {};
        user.tutorials[tutorial] = true;

        await interaction.followUp({content: tutorialData[tutorial].tutorial, ephemeral: true});
        await user.save();
    }
}

function runTutorials(user, interaction) {
    runTutorial(user, interaction, "start", user.stats?.numSearches);
    runTutorial(user, interaction, "items", user.items?.length);
    runTutorial(user, interaction, "hourglass", user.counter);
    runTutorial(user, interaction, "bait", user.upgrades?.coin?.bait);
    runTutorial(user, interaction, "shrine", (user.foxes?.orange ?? 0) >= 30);
    runTutorial(user, interaction, "coins", (user.foxes?.orange ?? 0) >= 30);
    runTutorial(user, interaction, "rarefox", user.foxes?.grey);
}

module.exports = {runTutorials};
