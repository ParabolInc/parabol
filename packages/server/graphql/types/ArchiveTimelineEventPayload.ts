import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import TimelineEvent from './TimelineEvent'
import makeMutationPayload from './makeMutationPayload'

export const ArchiveTimelineEventSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'ArchiveTimelineEventSuccess',
  fields: () => ({
    timelineEvent: {
      type: new GraphQLNonNull(TimelineEvent),
      description: 'the archived timelineEvent',
      resolve: async ({timelineEventId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('timelineEvents').load(timelineEventId)
      }
    }
  })
})

const ArchiveTimelineEventPayload = makeMutationPayload(
  'ArchiveTimelineEventPayload',
  ArchiveTimelineEventSuccess
)

export default ArchiveTimelineEventPayload
