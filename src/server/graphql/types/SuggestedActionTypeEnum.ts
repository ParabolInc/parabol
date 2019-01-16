import {GraphQLEnumType} from 'graphql'

const SuggestedActionTypeEnum = new GraphQLEnumType({
  name: 'SuggestedActionTypeEnum',
  description: 'The specific type of the suggested action',
  values: {
    inviteYourTeam: {},
    tryTheDemo: {},
    tryRetroMeeting: {},
    tryActionMeeting: {},
    createNewTeam: {}
  }
})

export default SuggestedActionTypeEnum
