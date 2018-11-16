import {
  acceptTeamInviteTeamMemberOnNext,
  acceptTeamInviteTeamMemberUpdater
} from 'universal/mutations/AcceptTeamInviteMutation'
import {
  inviteTeamMembersTeamMemberOnNext,
  inviteTeamMembersTeamMemberUpdater
} from 'universal/mutations/InviteTeamMembersMutation'
import {removeTeamMemberTeamMemberUpdater} from 'universal/mutations/RemoveTeamMemberMutation'
import {removeOrgUserTeamMemberUpdater} from 'universal/mutations/RemoveOrgUserMutation'
import {cancelApprovalTeamMemberUpdater} from 'universal/mutations/CancelApprovalMutation'
import {rejectOrgApprovalTeamMemberUpdater} from 'universal/mutations/RejectOrgApprovalMutation'
import {cancelTeamInviteTeamMemberUpdater} from 'universal/mutations/CancelTeamInviteMutation'

const subscription = graphql`
  subscription TeamMemberSubscription {
    teamMemberSubscription {
      __typename
      ...AcceptTeamInviteMutation_teamMember @relay(mask: false)
      ...CancelApprovalMutation_teamMember @relay(mask: false)
      ...CancelTeamInviteMutation_teamMember @relay(mask: false)
      ...InviteTeamMembersMutation_teamMember @relay(mask: false)
      ...MeetingCheckInMutation_teamMember @relay(mask: false)
      ...PromoteToTeamLeadMutation_teamMember @relay(mask: false)
      ...RejectOrgApprovalMutation_teamMember @relay(mask: false)
      ...RemoveOrgUserMutation_teamMember @relay(mask: false)
      ...RemoveTeamMemberMutation_teamMember @relay(mask: false)
      ...UpdateUserProfileMutation_teamMember @relay(mask: false)
    }
  }
`
const onNextHandlers = {
  AcceptTeamInvitePayload: acceptTeamInviteTeamMemberOnNext,
  InviteTeamMembersPayload: inviteTeamMembersTeamMemberOnNext
}

const TeamMemberSubscription = (atmosphere, queryVariables, subParams) => {
  const {dispatch} = subParams
  const {viewerId} = atmosphere
  const context = {...subParams, atmosphere}
  return {
    subscription,
    variables: {},
    updater: (store) => {
      const payload = store.getRootField('teamMemberSubscription')
      if (!payload) return
      const type = payload.getValue('__typename')
      switch (type) {
        case 'AcceptTeamInvitePayload':
          acceptTeamInviteTeamMemberUpdater(payload, store)
          break
        case 'CancelApprovalPayload':
          cancelApprovalTeamMemberUpdater(payload, store)
          break
        case 'CancelTeamInvitePayload':
          cancelTeamInviteTeamMemberUpdater(payload, store)
          break
        case 'InviteTeamMembersPayload':
          inviteTeamMembersTeamMemberUpdater(payload, store, dispatch)
          break
        case 'MeetingCheckInPayload':
          break
        case 'PromoteToTeamLeadPayload':
          break
        case 'RejectOrgApprovalPayload':
          rejectOrgApprovalTeamMemberUpdater(payload, store)
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
    },
    onNext: ({teamMemberSubscription}) => {
      const {__typename: type} = teamMemberSubscription
      const handler = onNextHandlers[type]
      if (handler) {
        handler(teamMemberSubscription, context)
      }
    }
  }
}

export default TeamMemberSubscription
