import {GraphQLObjectType} from 'graphql'
import {NewMeetingPhaseTypeEnum} from '../../../client/types/graphql'
import {GQLContext} from '../graphql'
import NewMeetingStage, {newMeetingStageFields} from './NewMeetingStage'

const phaseTypes = [
  NewMeetingPhaseTypeEnum.reflect,
  NewMeetingPhaseTypeEnum.group,
  NewMeetingPhaseTypeEnum.vote,
  NewMeetingPhaseTypeEnum.firstcall,
  NewMeetingPhaseTypeEnum.lastcall,
  NewMeetingPhaseTypeEnum.SCOPE
]

const GenericMeetingStage = new GraphQLObjectType<any, GQLContext>({
  name: 'GenericMeetingStage',
  description: 'A stage of a meeting that has no extra state. Only used for single-stage phases',
  interfaces: () => [NewMeetingStage],
  isTypeOf: ({phaseType}) => phaseTypes.includes(phaseType),
  fields: () => ({
    ...newMeetingStageFields()
  })
})

export default GenericMeetingStage
