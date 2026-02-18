import {GraphQLEnumType} from 'graphql'

const TimelineEventTypeEnum = new GraphQLEnumType({
  name: 'TimelineEventEnum',
  description: 'The specific type of event',
  values: {
    retroComplete: {},
    POKER_COMPLETE: {},
    TEAM_PROMPT_COMPLETE: {},
    actionComplete: {},
    createdTeam: {},
    joinedParabol: {}
  }
})

export default TimelineEventTypeEnum
