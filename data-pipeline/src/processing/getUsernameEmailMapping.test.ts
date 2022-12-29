import { test, expect } from '@jest/globals'
import { User } from '../github/users'
import getUsernameEmailMapping from './getUsernameEmailMapping'

test('getUsernameEmailMapping works as expected', () => {
    const userMap = { someRandomGhUser: { /* content doesn't really matter */ } as User }
    const skllsProfiles = {
        'random/file/path/user@email.com.json': {
            Usernames: ['someRandomGhUser', 'janedoe'],
        }
    }

    expect(getUsernameEmailMapping(userMap, skllsProfiles)).toStrictEqual({
        someRandomGhUser: ['user@email.com']
    })
})

test('getUsernameEmailMapping drops entries for which no user name matches', () => {
    const userMap = {
        someRandomGhUser: { /* content doesn't really matter */ } as User,
        anotherRandomGhUser: { /* content doesn't really matter */ } as User,
    }
    const skllsProfiles = {
        'random/file/path/user@email.com.json': {
            Usernames: ['someRandomGhUser', 'janedoe'],
        },
    }

    expect(getUsernameEmailMapping(userMap, skllsProfiles)).toStrictEqual({
        someRandomGhUser: ['user@email.com']
    })
})

test('getUsernameEmailMapping also works with @users.noreply.github.com email domains', () => {
    const userMap = { janedoe: { /* content doesn't really matter */ } as User }
    const skllsProfiles = {
        'random/file/path/janedoe@users.noreply.github.com.json': {
            Usernames: [],
        }
    }

    expect(getUsernameEmailMapping(userMap, skllsProfiles)).toStrictEqual({
        janedoe: ['janedoe@users.noreply.github.com']
    })
})