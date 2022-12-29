export default mapReducer

// Map Reducer for local data processing in a map-reduce style (see mapReducer.test.ts for example usage)
function mapReducer<InputType, MappedType, ResultType>(
    jobInput: InputType[],
    mapperFn: MapperFn<InputType, MappedType>,
    reducerFn: ReducerFn<MappedType, ResultType>,
    resultsFormat = ResultFormat.OBJECT,
) {
    const mappedValues = {} as {[channelName: string]: MappedType[]}
    const resultsValues = {} as {[channelName: string]: ResultType}
    
    const pushToReducer: PushToChannelFn<MappedType> = (channelName, value) => {
        if (!mappedValues[channelName]) {
            mappedValues[channelName] = [] as MappedType[]
        }
        mappedValues[channelName].push(value)
    }
    
    const pushToResults: PushToChannelFn<ResultType> = (channelName, value) => {
        resultsValues[channelName] = value
    }

    // Step #1 - Map all the values
    jobInput.forEach(input => mapperFn(input, pushToReducer))

    // Step #2 - Send all the mapped values through the reducer
    Object.entries(mappedValues).forEach(([channelName, values]) => reducerFn(channelName, values, pushToResults))
    
    // Step #3 - Return the values either as an Object or a Key-Value Array
    if (resultsFormat === ResultFormat.KEY_VALUE_ARRAY) {
        return Object.entries(resultsValues)
    }

    return resultsValues
}

export type MapperFn<InputType, MappedType> = (jobInput: InputType, pushToReducer: PushToChannelFn<MappedType>) => void
export type ReducerFn<MappedType, ResultType> = (channelName: string, values: MappedType[], pushToResults: PushToChannelFn<ResultType>) => void
export type PushToChannelFn<ValueType> = (channelName: string, value: ValueType) => void

export enum ResultFormat {
    OBJECT = 'OBJECT',
    KEY_VALUE_ARRAY = 'KEY_VALUE_ARRAY',
}