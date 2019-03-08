import {removeTeamMemberTeamMemberUpdater} from 'universal/mutations/RemoveTeamMemberMutation'
import {removeOrgUserTeamMemberUpdater} from 'universal/mutations/RemoveOrgUserMutation'

const subscription = graphql`
  subscription TeamMemberSubscription {
    teamMemberSubscription {
      __typename
      ...MeetingCheckInMutation_teamMember @relay(mask: false)
      ...RemoveOrgUserMutation_teamMember @relay(mask: false)
      ...RemoveTeamMemberMutation_teamMember @relay(mask: false)
      ...UpdateUserProfileMutation_teamMember @relay(mask: false)
    }
  }
`
const TeamMemberSubscription = (atmosphere) => {
  const {viewerId} = atmosphere
  return {
    subscription,
    variables: {},
    updater: (store) => {
      const payload = store.getRootField('teamMemberSubscription')
      if (!payload) return
      const type = payload.getValue('__typename')
      switch (type) {
        case 'MeetingCheckInPayload':
          break
        case 'RemoveOrgUserPayload':
          removeOrgUserTeamMemberUpdater(payload, store, viewerId)
          break
        case 'RemoveTeamMemberPayload':
          removeTeamMemberTeamMemberUpdater(payload, store)
          break
        case 'UpdateUserProfilePayload':
          break
        default:
          console.error('TeamMemberSubscription case fail', type)
      }
    }
  }
}

export default TeamMemberSubscription
