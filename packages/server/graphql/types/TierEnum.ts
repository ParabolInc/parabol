import {GraphQLEnumType} from 'graphql'

const TierEnum = new GraphQLEnumType({
  name: 'TierEnum',
  description: 'The pay tier of the team',
  values: {
    starter: {},
    team: {},
    enterprise: {}
  }
})

export default TierEnum
