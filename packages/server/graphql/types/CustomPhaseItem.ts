import {GraphQLBoolean, GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql'
import {resolveTeam} from '../resolvers'
import CustomPhaseItemTypeEnum from './CustomPhaseItemTypeEnum'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import ReflectPrompt from './ReflectPrompt'
import Team from './Team'

export const customPhaseItemFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'shortid'
  },
  createdAt: {
    type: new GraphQLNonNull(GraphQLISO8601Type)
  },
  phaseItemType: {
    type: CustomPhaseItemTypeEnum,
    deprecationReason: 'Field has been deprecated because type is guranteed to be `retroPhaseItem`'
  },
  isActive: {
    type: GraphQLBoolean,
    description: 'true if the phase item is currently used by the team, else false'
  },
  teamId: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'foreign key. use the team field'
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

export const CustomPhaseItem = new GraphQLInterfaceType({
  name: 'CustomPhaseItem',
  fields: customPhaseItemFields,
  // deprecationReason: 'Refactored to deterministically be ReflectPrompt',
  resolveType: () => {
    return ReflectPrompt
  }
})

export default CustomPhaseItem
