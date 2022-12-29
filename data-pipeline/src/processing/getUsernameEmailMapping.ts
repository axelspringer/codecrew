import { fstat, writeFileSync } from 'fs';
import { basename } from 'path'
import { SkllsProfile } from '../sklls-cli/profile';
import { addSynonymousEmails, combineArrays } from '../util/helper';
import { GithubUserMap } from "./joinSsoUsers";
import { SkllsProfiles } from "./loadSkllsProfiles";
import mapReducer, { MapperFn, ReducerFn, ResultFormat } from "./mapReducer";

export type UsernameEmailMap = { [username: string]: string[] }
export default getUsernameEmailMapping

function getUsernameEmailMapping (ghUsers: GithubUserMap, skllsProfiles: SkllsProfiles, synonymousEmailDomains: string[] = []): UsernameEmailMap {
    const userNamesSkllsMap = mapReducer<[string, SkllsProfile], string, string[]>(Object.entries(skllsProfiles), mapper, reducer, ResultFormat.OBJECT)

    // Add synonymous email domains
    Object.entries(userNamesSkllsMap).forEach(([username, emails]) => {
        const synonymousEmails = addSynonymousEmails(emails, synonymousEmailDomains)
        userNamesSkllsMap[username] = synonymousEmails
    })

    //  Only keep profiles for which we found a Github User
    const userNameEmailMap = {} as { [userName: string]: string[] }
    Object.keys(ghUsers).forEach(userName => {
        // Gather all emails that belong to one Github user
        // #1 Get all of the emails for that direct username
        const { email, secondaryEmail } = ghUsers[userName]
        const ghEmails = [email, secondaryEmail]

        // #2 Additionally, add all email arrays where email matches with github profile
        //    (i.e. someone committed under a different username, but with an email that is their work-email)
        let ghEmailOverlap = []
        Object.entries(userNamesSkllsMap).forEach(([userName, emails]) => {
            emails.forEach(emailFromCommit => {
                if (emailFromCommit === email || emailFromCommit === secondaryEmail) {
                    ghEmailOverlap = [...ghEmailOverlap, ...emails]
                }
            })
        })

        const emailsDedup = combineArrays(ghEmails, ghEmailOverlap)
        userNameEmailMap[userName] = emailsDedup
    })

    return userNameEmailMap
}

const mapper: MapperFn<[string, SkllsProfile], string> = (jobInput, pushToReducer) => {
    const [filePath, skllsProfile] = jobInput
    const email = basename(filePath, '.json')
    const userNames = skllsProfile.Usernames || []
    userNames.forEach(userName => pushToReducer(userName, email))

    const usernameInEmail = ghUsernameFromEmail(email)
    if (!!usernameInEmail) {
        pushToReducer(usernameInEmail, email)
    }
}

const reducer: ReducerFn<string, string[]> = (userName, values, pushToResults) => {
    let allEmails = []
    values.forEach(email => allEmails.includes(email) ? null : allEmails.push(email))
    pushToResults(userName, allEmails)
}

function ghUsernameFromEmail(email: string): string {
    const pattern = /\d*\+?(?<ghUsername>.*)@users.noreply.github.com/;
    const match = email.match(pattern);
    return match && match.groups && match.groups.ghUsername || ''
}