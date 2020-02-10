import {GraphQLBoolean, GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql'
import {RETRO_PHASE_ITEM} from 'parabol-client/utils/constants'
import RetroPhaseItem from './RetroPhaseItem'
import CustomPhaseItemTypeEnum from './CustomPhaseItemTypeEnum'
import Team from './Team'
import {resolveTeam} from '../resolvers'
import GraphQLISO8601Type from './GraphQLISO8601Type'

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
    description: 'The type of phase item'
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
    description: 'The team that owns this customPhaseItem',
    resolve: resolveTeam
  },
  updatedAt: {
    type: new GraphQLNonNull(GraphQLISO8601Type)
  }
})

const CustomPhaseItem = new GraphQLInterfaceType({
  name: 'CustomPhaseItem',
  fields: customPhaseItemFields,
  resolveType: ({phaseItemType}) => {
    const resolveTypeLookup = {
      [RETRO_PHASE_ITEM]: RetroPhaseItem
    }
    return resolveTypeLookup[phaseItemType]
  }
})

export default CustomPhaseItem
