import {GraphQLFieldConfigMap} from 'graphql'
import TimelineEvent from '../../../database/types/TimelineEvent'
import {GQLContext} from '../../graphql'
import {timelineEventInterfaceFields} from '../../types/TimelineEvent'

type TimelineEventSource = TimelineEvent & {orgId: string; teamId: string}

export const timelineEventInterfaceResolvers = () =>
  Object.fromEntries(
    Object.entries(
      timelineEventInterfaceFields() as GraphQLFieldConfigMap<TimelineEventSource, GQLContext>
    )
      .filter(([_, value]) => !!value.resolve)
      .map(([key, value]) => [key, value.resolve])
  )

export default timelineEventInterfaceResolvers()
