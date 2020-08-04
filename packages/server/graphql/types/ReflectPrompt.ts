import {GraphQLBoolean, GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql'
import {RETRO_PHASE_ITEM} from 'parabol-client/utils/constants'
import RetroPhaseItem from './RetroPhaseItem'
import ReflectPromptTypeEnum, {CustomPhaseItemTypeEnum} from './ReflectPromptTypeEnum'
import Team from './Team'
import {resolveTeam} from '../resolvers'
import GraphQLISO8601Type from './GraphQLISO8601Type'

export const reflectPromptFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'shortid'
  },
  createdAt: {
    type: new GraphQLNonNull(GraphQLISO8601Type)
  },
  phaseItemType: {
    type: CustomPhaseItemTypeEnum,
    deprecationReason: 'Field has been deprecated in favor of reflectprompt'
  },
  reflectPromptType: {
    type: ReflectPromptTypeEnum,
    description: 'The type of reflect prompt'
  },
  isActive: {
    type: GraphQLBoolean,
    description: 'true if the phase item is currently used by the team, else false'
  },
  teamId: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'foreign key. use the team field'
  },
  templateId: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'foreign key. use the template field'
  },
  team: {
    type: Team,
    description: 'The team that owns this reflectPrompt',
    resolve: resolveTeam
  },
  updatedAt: {
    type: new GraphQLNonNull(GraphQLISO8601Type)
  }
})

const ReflectPrompt = new GraphQLInterfaceType({
  name: 'ReflectPrompt',
  fields: reflectPromptFields,
  resolveType: ({promptType}) => {
    const resolveTypeLookup = {
      [RETRO_PHASE_ITEM]: RetroPhaseItem
    }
    return resolveTypeLookup[promptType]
  }
})

export const CustomPhaseItem = new GraphQLInterfaceType({
  name: 'CustomPhaseItem',
  fields: reflectPromptFields,
  resolveType: ({promptType}) => {
    const resolveTypeLookup = {
      [RETRO_PHASE_ITEM]: RetroPhaseItem
    }
    return resolveTypeLookup[promptType]
  }
})

export default ReflectPrompt
