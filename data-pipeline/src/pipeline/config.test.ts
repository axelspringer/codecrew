import { test, expect } from '@jest/globals'
import { loadConfig } from './config'

test('loadConfig works as expected', () => {
    const config = loadConfig('./fixtures/mockConfig.js')
    expect(config).toStrictEqual({ dataBranch: 'data', commitEmail: 'tech@axelspringer.com', })
})

test('loadConfig throw error when file could not be found', () => {
    expect(() => loadConfig('./fixtures/configDoesNotExist.js')).toThrowError('Canot find config file with path: ./fixtures/configDoesNotExist.js')
})