import {GraphQLEnumType} from 'graphql'
import {
  AGENDA_ITEMS,
  CHECKIN,
  DISCUSS,
  FIRST_CALL,
  GROUP,
  LAST_CALL,
  REFLECT,
  UPDATES,
  VOTE
} from 'universal/utils/constants'

const NewMeetingPhaseTypeEnum = new GraphQLEnumType({
  name: 'NewMeetingPhaseTypeEnum',
  description: 'The phase of the meeting',
  values: {
    // Generic
    [CHECKIN]: {},
    // Action
    [UPDATES]: {},
    [FIRST_CALL]: {},
    [AGENDA_ITEMS]: {},
    [LAST_CALL]: {},
    // Retro
    [REFLECT]: {},
    [GROUP]: {},
    [VOTE]: {},
    [DISCUSS]: {}
  }
})

export default NewMeetingPhaseTypeEnum
