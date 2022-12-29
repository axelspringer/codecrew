export type Config = {
    dataBranch: string,
    commitAuthor: string,
    commitEmail: string,
    whoAmI: string,
    repoAnalysisLimit: number,
    minLoc: number,
    ghOrg: string,
    dryRun: boolean,
    synonymousEmailDomains: string[],
    excludeExt: string[],
    inactiveProfileCutoffDays: number,
}

export function loadConfig (path: string): Config {
    let config = {} as Config
    try {
        config = require(path)
    } catch (error) {
        throw new Error('Canot find config file with path: ' + path)
    }

    return config as Config
}