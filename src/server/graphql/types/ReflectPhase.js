import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import NewMeetingPhase, {newMeetingPhaseFields} from 'server/graphql/types/NewMeetingPhase'
import RetroPhaseItem from 'server/graphql/types/RetroPhaseItem'
import GenericMeetingStage from 'server/graphql/types/GenericMeetingStage'
import {RETRO_PHASE_ITEM} from 'universal/utils/constants'

const ReflectPhase = new GraphQLObjectType({
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
      resolve: ({focusedPhaseItemId}, args, {dataLoader}) => {
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
      resolve: async ({teamId}, _args, {dataLoader}) => {
        const phaseItems = await dataLoader.get('customPhaseItemsByTeamId').load(teamId)
        return phaseItems.filter(({phaseItemType}) => phaseItemType === RETRO_PHASE_ITEM)
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
