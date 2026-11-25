import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {OrgInviteeFieldQuery} from '../../__generated__/OrgInviteeFieldQuery.graphql'
import InviteeField, {type InviteeFieldProps} from './InviteeField'
import OrgInviteeFieldDirectory from './OrgInviteeFieldDirectory'

export type OrgInviteeFieldProps = Omit<InviteeFieldProps, 'directory'> & {
  queryRef: PreloadedQuery<OrgInviteeFieldQuery>
}

const OrgInviteeField = (props: OrgInviteeFieldProps) => {
  const {queryRef, ...fieldProps} = props
  const data = usePreloadedQuery<OrgInviteeFieldQuery>(
    graphql`
      query OrgInviteeFieldQuery(
        $orgId: ID!
        $meetingsAfter: DateTime!
        $meetingsBefore: DateTime!
      ) {
        viewer {
          ...useInviteeDirectory_viewer @arguments(meetingsAfter: $meetingsAfter, meetingsBefore: $meetingsBefore)
          organization(orgId: $orgId) {
            ...useInviteeDirectory_organization
          }
        }
      }
    `,
    queryRef
  )
  const {viewer} = data
  const {organization} = viewer
  if (!organization) return <InviteeField {...fieldProps} directory={null} />
  return (
    <OrgInviteeFieldDirectory {...fieldProps} viewerRef={viewer} organizationRef={organization} />
  )
}

export default OrgInviteeField
