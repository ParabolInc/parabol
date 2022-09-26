import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import TimelineEvent, {timelineEventInterfaceFields} from './TimelineEvent'
import {JOINED_PARABOL} from './TimelineEventTypeEnum'

const TimelineEventJoinedParabol = new GraphQLObjectType<any, GQLContext>({
  name: 'TimelineEventJoinedParabol',
  description: 'An event for joining the app',
  interfaces: () => [TimelineEvent],
  isTypeOf: ({type}) => type === JOINED_PARABOL,
  fields: () => ({
    // no idea why i have to cast as any here...
    ...(timelineEventInterfaceFields() as any)
  })
})

export default TimelineEventJoinedParabol
