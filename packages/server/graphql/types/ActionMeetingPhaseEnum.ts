import {GraphQLEnumType} from 'graphql'
import {
  AGENDA_ITEMS,
  CHECKIN,
  FIRST_CALL,
  LAST_CALL,
  LOBBY,
  SUMMARY,
  UPDATES
} from 'parabol-client/utils/constants'

const ActionMeetingPhaseEnum = new GraphQLEnumType({
  name: 'ActionMeetingPhaseEnum',
  description: 'The phases of an action meeting',
  values: {
    [LOBBY]: {},
    [CHECKIN]: {},
    [UPDATES]: {},
    [FIRST_CALL]: {},
    [AGENDA_ITEMS]: {},
    [LAST_CALL]: {},
    [SUMMARY]: {}
  }
})

export default ActionMeetingPhaseEnum
