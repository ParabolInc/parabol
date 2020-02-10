import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import NewMeetingPhase, {newMeetingPhaseFields} from './NewMeetingPhase'
import RetroPhaseItem from './RetroPhaseItem'
import GenericMeetingStage from './GenericMeetingStage'
import {GQLContext} from '../graphql'

const ReflectPhase = new GraphQLObjectType<any, GQLContext>({
  name: 'ReflectPhase',
  description: 'The meeting phase where all team members check in one-by-one',
  interfaces: () => [NewMeetingPhase],
  fields: () => ({
    ...newMeetingPhaseFields(),
    focusedPhaseItemId: {
      type: GraphQLID,
      description: 'foreign key. use focusedPhaseItem'
    },
    focusedPhaseItem: {
      type: RetroPhaseItem,
      description: 'the phase item that the facilitator wants the group to focus on',
      resolve: ({focusedPhaseItemId}, _args, {dataLoader}) => {
        return dataLoader.get('customPhaseItems').load(focusedPhaseItemId)
      }
    },
    promptTemplateId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'FK. The ID of the template used during the reflect phase'
    },
    reflectPrompts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(RetroPhaseItem))),
      description: 'The prompts used during the reflect phase',
      resolve: async ({promptTemplateId, teamId}, _args, {dataLoader}) => {
        const phaseItems = await dataLoader.get('customPhaseItemsByTeamId').load(teamId)
        const prompts = phaseItems.filter(({templateId}) => templateId === promptTemplateId)
        prompts.sort((a, b) => (a.sortOrder < b.sortOrder ? -1 : 1))
        return prompts
      }
    },
    stages: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GenericMeetingStage)))
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  })
})

export default ReflectPhase
