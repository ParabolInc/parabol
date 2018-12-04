import {GraphQLObjectType} from 'graphql'
import TimelineEvent, {timelineEventInterfaceFields} from './TimelineEvent'

const TimelineEventJoinedParabol = new GraphQLObjectType({
  name: 'TimelineEventJoinedParabol',
  description: 'An event for joining the app',
  interfaces: () => [TimelineEvent],
  fields: () => ({
    ...timelineEventInterfaceFields()
  })
})

export default TimelineEventJoinedParabol
