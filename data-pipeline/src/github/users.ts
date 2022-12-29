import { graphql } from "@octokit/graphql";

export type GithubUser = {
    name: string,
    ghUserName: string,
    email: string,
    avatarUrl: string,
    bio: string,
    bioHTML: string,
    location: string,
    url: string,
}

export default listUsers

async function listUsers (organization: string, token: string, progressCb?: (recordsFound: number) => void): Promise<GithubUser[]> {
    let users = [] as GithubUser[]

    let hasNextPage = true
    let cursor = null
    while (hasNextPage) {
        const res = await graphql(
            `
            query{
                organization(login: "${organization}") {
                    membersWithRole(first: 100, after:${cursor ? `"${cursor}"` : `null`}) {
                        pageInfo{
                            endCursor,
                            hasNextPage,
                        },
                        nodes{
                            name,
                            login,
                            email,
                            avatarUrl,
                            bio,
                            bioHTML,
                            location,
                            url,
                        }  
                    }
                  }
            }
            `,
            {
              headers: {
                authorization: `token ${token}`,
              },
            }
          ) as UsersGraphQlResponse;
    
        const mappedUsers = mapUsers(res)
        users = [...users, ...mappedUsers]
        if (progressCb) { progressCb(users.length) }

        hasNextPage = res.organization?.membersWithRole.pageInfo.hasNextPage || false
        cursor = res.organization?.membersWithRole.pageInfo.endCursor || null
    }

    return users
}

export type UsersGraphQlResponse = {
    organization: {
        membersWithRole: {
            pageInfo: {
                endCursor: string,
                hasNextPage: boolean,
            },
            nodes: {
                name: string,
                login: string,
                email: string,
                avatarUrl: string,
                bio: string,
                bioHTML: string,
                location: string,
                url: string,
            }[]
        }
    }
}
export const mapUsers = (graphQlRes: UsersGraphQlResponse): GithubUser[] => {
    const usersRaw = graphQlRes.organization?.membersWithRole?.nodes || []
    return usersRaw.map(({ login, ...rest }) => ({ ghUserName: login, ...rest })) as GithubUser[]
}