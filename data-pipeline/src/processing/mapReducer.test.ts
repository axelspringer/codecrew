import { describe, test, expect } from '@jest/globals'
import loremIpsum from './fixtures/lorem-ipsum'
import mapReducer, { MapperFn, ReducerFn, ResultFormat } from './mapReducer'

describe('mapReducer', () => {
    const jobInput = loremIpsum.split('\n')
    const mapper: MapperFn<string, number> = (jobInput, pushToReducer) => {
        const words = jobInput.split(' ')
        const wordsFiltered = words.filter(word => word.trim() !== '')
        wordsFiltered.forEach(word => {
            pushToReducer(word, 1)
        })
    }
    const reducer: ReducerFn<number, number> = (channelName, values, pushToResults) => {
        let count = 0
        values.forEach(value => count += value)
        pushToResults(channelName, count)
    }

    test('Works as expected (default = Return values as an object)', () => {
        const wordCount = mapReducer(jobInput, mapper, reducer)
        expect(wordCount).toEqual({
            "das": 3,
            "der": 3,
            "die": 3,
            "warum": 1,
            "was": 2,
            "wer": 2,
            "weshalb": 1,
            "wie": 2,
            "wieso": 1,
        })
    })

    test('Works as expected (default = Return values as an object)', () => {
        const wordCount = mapReducer(jobInput, mapper, reducer, ResultFormat.KEY_VALUE_ARRAY)
        expect(wordCount).toEqual([["der", 3], ["die", 3], ["das", 3], ["wer", 2], ["wie", 2], ["was", 2], ["wieso", 1], ["weshalb", 1], ["warum", 1]])
    })
})