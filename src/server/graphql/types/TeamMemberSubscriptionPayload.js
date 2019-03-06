import graphQLSubscriptionType from 'server/graphql/graphQLSubscriptionType'
import MeetingCheckInPayload from 'server/graphql/types/MeetingCheckInPayload'
import RemoveTeamMemberPayload from 'server/graphql/types/RemoveTeamMemberPayload'
import RemoveOrgUserPayload from 'server/graphql/types/RemoveOrgUserPayload'
import UpdateUserProfilePayload from 'server/graphql/types/UpdateUserProfilePayload'

const types = [
  RemoveTeamMemberPayload,
  MeetingCheckInPayload,
  RemoveOrgUserPayload,
  UpdateUserProfilePayload
]

export default graphQLSubscriptionType('TeamMemberSubscriptionPayload', types)
