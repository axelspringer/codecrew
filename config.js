module.exports = {
    // Name of the branch where all the data is stored to
    dataBranch: 'data',
    
    // PRO TIP: Use another data branch for development :)
    // dataBranch: 'SANDBOX-data',

    // Username used during update-data job commits
    commitAuthor: 'codecrew data bot 🤖',

    // Email used during update-data job commits
    commitEmail: 'tech@axelspringer.com',

    // TODO: Automate this! (this is the name of this repo!)
    whoAmI: 'axelspringer/codecrew',

    // Limit of repos analyzed with the sklls-CLI in every sklls-data-pipeline run
    repoAnalysisLimit: 25,

    // Minimum lines of code used to list something as a ext / dependency skill
    minLoc: 10,

    // Github to analyze with sklls CLI
    ghOrg: 'axelspringer',

    // --- Data Pipeline stuff --- //
    // If set to true, no changes will be pushed back to the data branch (good for development purposes)
    dryRun: true,

    // Email domains that should be treated as synonymous - e.g. when your company rebrands / merges
    // Example: ['spring-media', 'axelspringer.com'] // This means someone@axelspringer.com and someone@spring-media.com are treated as the same person
    synonymousEmailDomains: [],

    // Extensions to hide from sklls-profiles
    excludeExt: [
        '',
        '.json',
        '.lock',
        '.txt',
    ],

    // Exclude profiles which had their last commit longer than ___ days ago. (useful to hide ex-colleagues)
    inactiveProfileCutoffDays: 90,
}