import {createContext} from 'react'

// true where a meeting is rendered from a fixture, e.g. the Team Health demo, so nothing the visitor
// does may fire a mutation. Real meetings never provide it and keep the default
const ReadOnlyMeetingContext = createContext(false)

export default ReadOnlyMeetingContext
