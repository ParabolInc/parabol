import {GraphQLObjectType} from 'graphql'
import type {GQLContext} from '../graphql'
import TimelineEvent, {timelineEventInterfaceFields} from './TimelineEvent'

const TimelineEventJoinedParabol = new GraphQLObjectType<any, GQLContext>({
  name: 'TimelineEventJoinedParabol',
  description: 'An event for joining the app',
  interfaces: () => [TimelineEvent],
  isTypeOf: ({type}) => type === 'joinedParabol',
  fields: () => ({
    // no idea why i have to cast as any here...
    ...(timelineEventInterfaceFields() as any)
  })
})

export default TimelineEventJoinedParabol
