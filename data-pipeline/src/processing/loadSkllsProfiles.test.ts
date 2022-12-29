import { test, expect } from '@jest/globals'
import { resolve } from 'path'
import loadSkllsProfiles from './loadSkllsProfiles'

test('loadSkllsProfiles works as expected', () => {
    const profiles = loadSkllsProfiles(resolve('./src/processing/fixtures/sklls-profiles'))
    expect(Object.values(profiles)).toMatchSnapshot()
})