import { GithubSsoIdentity } from "../github/ssoIdentities";
import { GithubUser as GithubUser } from '../github/users'

export type GithubUserMap = { [ghUserName: string]: GithubUserExtended }
export type GithubUserExtended = GithubUser & {
    secondaryEmail: string
} 

export default joinSsoUsers

function joinSsoUsers (users: GithubUser[], ssoIdentities: GithubSsoIdentity[]): GithubUserMap {
    const ssoUsers: { [ghUsername: string]: string } = {}
    ssoIdentities.forEach(({ ssoEmail, ghUserName }) => ssoUsers[ghUserName] = ssoEmail)

    const mergedUsers = users.map(({ email: secondaryEmail, ghUserName, ...rest }) => (
        ssoUsers[ghUserName]
        ? { email: ssoUsers[ghUserName], secondaryEmail, ghUserName, ...rest }
        : null
    ))
    
    const mergedUserMap: { [ghUserName: string]: GithubUserExtended } = {}
    mergedUsers.filter(mergedUser => !!mergedUser).forEach(({ ghUserName, ...rest }) => mergedUserMap[ghUserName] = { ghUserName, ...rest })
    return mergedUserMap
}