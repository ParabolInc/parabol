import {GraphQLEnumType} from 'graphql'

export type UserFeatureFlagEnum = 'spotlight'

const UserFlagEnum = new GraphQLEnumType({
  name: 'UserFlagEnum',
  description: 'A flag to give an individual user super powers',
  values: {
    spotlight: {}
  }
})

export default UserFlagEnum
