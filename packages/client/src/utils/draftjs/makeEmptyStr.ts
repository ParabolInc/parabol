import {ContentState, convertToRaw} from 'draft-js'

const makeEmptyStr = () => JSON.stringify(convertToRaw(ContentState.createFromText('')))

export default makeEmptyStr
