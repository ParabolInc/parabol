import {GraphQLEnumType} from 'graphql'

export type UserFeatureFlagEnum = 'spotlight' | 'standups' | 'gitlab'

const UserFlagEnum = new GraphQLEnumType({
  name: 'UserFlagEnum',
  description: 'A flag to give an individual user super powers',
  values: {
    spotlight: {},
    standups: {},
    gitlab: {},
    msTeams: {}
  }
})

export default UserFlagEnum
