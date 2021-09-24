import {GraphQLEnumType} from 'graphql'

const TeamDrawer = new GraphQLEnumType({
  name: 'TeamDrawer',
  description: 'The right drawer types available on the team dashboard',
  values: {
    agenda: {},
    manageTeam: {}
  }
})

export default TeamDrawer
