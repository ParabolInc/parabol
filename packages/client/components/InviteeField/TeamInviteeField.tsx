import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {TeamInviteeFieldQuery} from '../../__generated__/TeamInviteeFieldQuery.graphql'
import InviteeField, {type InviteeFieldProps} from './InviteeField'
import OrgInviteeFieldDirectory from './OrgInviteeFieldDirectory'

export type TeamInviteeFieldProps = Omit<InviteeFieldProps, 'directory'> & {
  queryRef: PreloadedQuery<TeamInviteeFieldQuery>
}

const TeamInviteeField = (props: TeamInviteeFieldProps) => {
  const {queryRef, ...fieldProps} = props
  const data = usePreloadedQuery<TeamInviteeFieldQuery>(
    graphql`
      query TeamInviteeFieldQuery(
        $teamId: ID!
        $meetingsAfter: DateTime!
        $meetingsBefore: DateTime!
      ) {
        viewer {
          ...useInviteeDirectory_viewer @arguments(meetingsAfter: $meetingsAfter, meetingsBefore: $meetingsBefore)
          team(teamId: $teamId) {
            organization {
              ...useInviteeDirectory_organization
            }
          }
        }
      }
    `,
    queryRef
  )
  const {viewer} = data
  const organization = viewer.team?.organization
  if (!organization) return <InviteeField {...fieldProps} directory={null} />
  return (
    <OrgInviteeFieldDirectory {...fieldProps} viewerRef={viewer} organizationRef={organization} />
  )
}

export default TeamInviteeField
