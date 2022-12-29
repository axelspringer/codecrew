// TODO: Refactor types in data-processing in a way that it's easy to import them here

// data/users.json
export type UIUsers = {
    [userName: string]: UIUser,
}

export type UIUser = UISklls & {
    Usernames: string[],
    ghUserName: string,
    email: string,
    secondaryEmail: string,
    name: string,
    avatarUrl: string,
    bio: string,
    bioHTML: string,
    location: string,
    url: string,
}

// data/teams.json
export type UITeams = UITeam[]

export type UITeam = UISklls & {
    name: string,
    avatarUrl: string,
    teamsUrl: string,
    description: string,
    createdAt: string,
    members: {
        ghUserName: string,
        avatarUrl: string,
    }[]
}

export type UISklls = {
    Dep: {
        [parserName: string]: {
            [dep: string]: number,
        }
    },
    Ext: {
        [ext: string]: number,
    },
    LastCommit: string,
}