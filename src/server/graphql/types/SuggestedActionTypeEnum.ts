import {GraphQLEnumType} from 'graphql'

export const INVITE_YOUR_TEAM = 'inviteYourTeam'

const SuggestedActionTypeEnum = new GraphQLEnumType({
  name: 'SuggestedActionTypeEnum',
  description: 'The specific type of the suggested action',
  values: {
    [INVITE_YOUR_TEAM]: {}
  }
})

export default SuggestedActionTypeEnum
