import {GraphQLObjectType} from 'graphql'
import NewMeetingStage, {newMeetingStageFields} from './NewMeetingStage'
import {GQLContext} from '../graphql'

const GenericMeetingStage = new GraphQLObjectType<any, GQLContext>({
  name: 'GenericMeetingStage',
  description: 'A stage of a meeting that has no extra state. Only used for single-stage phases',
  interfaces: () => [NewMeetingStage],
  fields: () => ({
    ...newMeetingStageFields()
  })
})

export default GenericMeetingStage
