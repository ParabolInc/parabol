import {GraphQLEnumType} from 'graphql'

const UserFlagEnum = new GraphQLEnumType({
  name: 'UserFlagEnum',
  description: 'A flag to give an individual user super powers',
  values: {
    jira: {},
    poker: {},
    spotlight: {}
  }
})

export default UserFlagEnum
