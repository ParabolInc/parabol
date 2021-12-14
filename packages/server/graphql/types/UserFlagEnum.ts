import {GraphQLEnumType} from 'graphql'

export type UserFeatureFlagEnum = 'spotlight' | 'standups'

const UserFlagEnum = new GraphQLEnumType({
  name: 'UserFlagEnum',
  description: 'A flag to give an individual user super powers',
  values: {
    spotlight: {},
    standups: {}
  }
})

export default UserFlagEnum
