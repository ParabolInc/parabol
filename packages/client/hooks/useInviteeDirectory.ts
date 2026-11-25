import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {useFragment} from 'react-relay'
import type {
  useInviteeDirectory_organization$data,
  useInviteeDirectory_organization$key
} from '../__generated__/useInviteeDirectory_organization.graphql'
import type {
  useInviteeDirectory_viewer$data,
  useInviteeDirectory_viewer$key
} from '../__generated__/useInviteeDirectory_viewer.graphql'
import {type InviteeDirectory, makeInviteeDirectory} from '../utils/inviteeDirectory'
import toMeetingPartners from '../utils/toMeetingPartners'

export const toInviteeDirectory = (
  viewer: useInviteeDirectory_viewer$data,
  organization: useInviteeDirectory_organization$data
): InviteeDirectory => {
  const orgTeams = viewer.teams.filter(({orgId}) => orgId === organization.id)
  return makeInviteeDirectory({
    orgName: organization.name,
    viewerId: viewer.id,
    approvedDomains: organization.approvedDomains ?? [],
    members: organization.organizationUsers.edges.map(({node}) => ({
      id: node.user.id,
      preferredName: node.user.preferredName,
      email: node.user.email,
      picture: node.user.picture
    })),
    partners: toMeetingPartners(
      viewer.id,
      orgTeams,
      viewer.meetings.edges.map(({node}) => node)
    ),
    teams: orgTeams.map(({id, name, teamMembers}) => ({
      id,
      name,
      memberIds: teamMembers.map(({user}) => user.id)
    }))
  })
}

const useInviteeDirectory = (
  viewerRef: useInviteeDirectory_viewer$key,
  organizationRef: useInviteeDirectory_organization$key
): InviteeDirectory => {
  const viewer = useFragment(
    graphql`
      fragment useInviteeDirectory_viewer on User
      @argumentDefinitions(
        meetingsAfter: {type: "DateTime!"}
        meetingsBefore: {type: "DateTime!"}
      ) {
        id
        teams {
          id
          name
          orgId
          teamMembers {
            user {
              id
            }
          }
        }
        meetings(
          first: 200
          meetingTypes: [action, retrospective, poker, teamPrompt, teamHealth]
          after: $meetingsAfter
          before: $meetingsBefore
        ) {
          edges {
            node {
              id
              teamId
              meetingType
              createdAt
              meetingMembers {
                user {
                  id
                }
              }
            }
          }
        }
      }
    `,
    viewerRef
  )
  const organization = useFragment(
    graphql`
      fragment useInviteeDirectory_organization on Organization {
        id
        name
        approvedDomains
        organizationUsers {
          edges {
            node {
              user {
                id
                preferredName
                email
                picture
              }
            }
          }
        }
      }
    `,
    organizationRef
  )
  return useMemo(() => toInviteeDirectory(viewer, organization), [viewer, organization])
}

export default useInviteeDirectory
