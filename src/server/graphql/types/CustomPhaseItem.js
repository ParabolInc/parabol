import {GraphQLBoolean, GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql'
import {RETRO_PHASE_ITEM} from 'universal/utils/constants'
import RetroPhaseItem from 'server/graphql/types/RetroPhaseItem'
import CustomPhaseItemTypeEnum from 'server/graphql/types/CustomPhaseItemTypeEnum'
import Team from 'server/graphql/types/Team'
import {resolveTeam} from 'server/graphql/resolvers'

export const customPhaseItemFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'shortid'
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
