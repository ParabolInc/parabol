import {GraphQLObjectType} from 'graphql'
import TimelineEvent, {timelineEventInterfaceFields} from './TimelineEvent'
import {JOINED_PARABOL} from './TimelineEventTypeEnum'

const TimelineEventJoinedParabol = new GraphQLObjectType({
  name: 'TimelineEventJoinedParabol',
  description: 'An event for joining the app',
  interfaces: () => [TimelineEvent],
  isTypeOf: ({type}) => type === JOINED_PARABOL,
  fields: () => ({
    ...timelineEventInterfaceFields()
  })
})

export default TimelineEventJoinedParabol
