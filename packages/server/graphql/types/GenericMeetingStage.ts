import {GraphQLObjectType} from 'graphql'
import NewMeetingStage, {newMeetingStageFields} from 'server/graphql/types/NewMeetingStage'
import {GQLContext} from 'server/graphql/graphql'

const GenericMeetingStage = new GraphQLObjectType<any, GQLContext, any>({
  name: 'GenericMeetingStage',
  description: 'A stage of a meeting that has no extra state. Only used for single-stage phases',
  interfaces: () => [NewMeetingStage],
  fields: () => ({
    ...newMeetingStageFields()
  })
})

export default GenericMeetingStage
