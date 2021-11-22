import {GraphQLEnumType} from 'graphql'

export type UserFeatureFlagEnum = 'jira' | 'poker' | 'spotlight'

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
