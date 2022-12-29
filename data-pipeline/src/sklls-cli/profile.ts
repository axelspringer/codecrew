export type SkllsProfile = {
    Usernames: string[],
    Ext: {
        [extName: string]: {
            [dateStr: string]: number,
        }
    },
    Dep: {
        [parserName: string]: {
            [dep: string]: {
                [dateStr: string]: number,
            }
        }
    },
    LastCommit: string,
}