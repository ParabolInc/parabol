import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveGQLStagesFromPhase} from '../resolvers'
import GenericMeetingStage from './GenericMeetingStage'
import NewMeetingPhase, {newMeetingPhaseFields} from './NewMeetingPhase'
import ReflectPrompt from './ReflectPrompt'

const ReflectPhase = new GraphQLObjectType<any, GQLContext>({
  name: 'ReflectPhase',
  description: 'The meeting phase where all team members check in one-by-one',
  interfaces: () => [NewMeetingPhase],
  fields: () => ({
    ...newMeetingPhaseFields(),
    focusedPhaseItemId: {
      deprecationReason: 'use focusedPromptId',
      type: GraphQLID,
      description: 'foreign key. use focusedPhaseItem'
    },
    focusedPhaseItem: {
      type: ReflectPrompt,
      deprecationReason: 'use focusedPrompt',
      description: 'the phase item that the facilitator wants the group to focus on',
      resolve: ({focusedPhaseItemId}, _args, {dataLoader}) => {
        return dataLoader.get('reflectPrompts').load(focusedPhaseItemId)
      }
    },
    focusedPromptId: {
      type: GraphQLID,
      description: 'foreign key. use focusedPrompt',
      resolve: ({focusedPhaseItemId}) => focusedPhaseItemId
    },
    focusedPrompt: {
      type: ReflectPrompt,
      description: 'the Prompt that the facilitator wants the group to focus on',
      resolve: ({focusedPhaseItemId}, _args, {dataLoader}) => {
        return dataLoader.get('reflectPrompts').load(focusedPhaseItemId)
      }
    },
    promptTemplateId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'FK. The ID of the template used during the reflect phase'
    },
    reflectPrompts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ReflectPrompt))),
      description: 'The prompts used during the reflect phase',
      resolve: async ({promptTemplateId}, _args, {dataLoader}) => {
        const prompts = await dataLoader.get('reflectPromptsByTemplateId').load(promptTemplateId)
        return prompts
      }
    },
    stages: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GenericMeetingStage))),
      resolve: resolveGQLStagesFromPhase
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  })
})

export default ReflectPhase
