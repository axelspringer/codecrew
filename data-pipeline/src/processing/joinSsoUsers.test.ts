import { test, expect } from "@jest/globals";
import { User } from '../github/users';
import { DeveloperSsoIdentity } from "../github/ssoIdentities";
import joinSsoUsers from './joinSsoUsers'

test('mergeUsers works as expected', () => {
    const githubUser: User = {
        ghUserName: 'github-username',
        email: 'publicEmail@email.com',
    }

    const ssoIdentity: DeveloperSsoIdentity = {
        ghUserName: 'github-username',
        ssoEmail: 'ssoIdentityEmail@email.com'
    }

    expect(joinSsoUsers([githubUser], [ssoIdentity])).toStrictEqual({
        'github-username': {
            ghUserName: 'github-username',
            email: 'ssoIdentityEmail@email.com',
            secondaryEmail: 'publicEmail@email.com',
        }
    })
})

test('mergeUsers filters out users for which no SSO identity exists', () => {
    const githubUsers: User = [
        {
            ghUserName: 'github-username',
            email: 'publicEmail@email.com',  
        },
        {
            ghUserName: 'another-github-username',
            email: 'anotherPublicEmail@email.com',  
        },
    ]

    const ssoIdentities: DeveloperSsoIdentity = [{
        ghUserName: 'github-username',
        ssoEmail: 'ssoIdentityEmail@email.com'
    }]

    expect(joinSsoUsers(githubUsers, ssoIdentities)).toStrictEqual({
        'github-username': {
            ghUserName: 'github-username',
            email: 'ssoIdentityEmail@email.com',
            secondaryEmail: 'publicEmail@email.com',
        }
    })
})