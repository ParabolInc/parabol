import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import TeamMember from './TeamMember'

const AgendaItem = new GraphQLObjectType<any, GQLContext>({
  name: 'AgendaItem',
  description: 'A request placeholder that will likely turn into 1 or more tasks',
  fields: () => ({
    // ideally all fields would be moved to codegen, but something brakes in merging schemes if this particular field is removed. No need to investigate further, we can get rid of of this whole object once it's no longer referenced by other legacy graphql definitions
    teamMember: {
      type: new GraphQLNonNull(TeamMember),
      description: 'The team member that created the agenda item'
    }
  })
})

export default AgendaItem
