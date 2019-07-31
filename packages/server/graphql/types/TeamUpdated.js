import {GraphQLObjectType} from 'graphql'
import {resolveTeam} from '../resolvers'
import Team from './Team'

const TeamUpdated = new GraphQLObjectType({
  name: 'TeamUpdated',
  fields: () => ({
    team: {
      type: Team,
      resolve: resolveTeam
    }
  })
})

export default TeamUpdated
