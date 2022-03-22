import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {InvitationLinkRootQuery} from '../__generated__/InvitationLinkRootQuery.graphql'
import TeamInvitationMeetingAbstract from './TeamInvitationMeetingAbstract'
import InvitationLinkDialog from './InvitationLinkDialog'

interface Props {
  queryRef: PreloadedQuery<InvitationLinkRootQuery>
}

function InvitationLink(props: Props) {
  const {queryRef} = props
  const data = usePreloadedQuery<InvitationLinkRootQuery>(
    graphql`
      query InvitationLinkRootQuery($token: ID!) {
        massInvitation(token: $token) {
          ...InvitationLinkDialog_massInvitation
        }
      }
    `,
    queryRef,
    {UNSTABLE_renderPolicy: 'full'}
  )
  const {massInvitation} = data
  // the meeting background is prettier than the plain one, so let's always use it
  return (
    <TeamInvitationMeetingAbstract>
      <InvitationLinkDialog massInvitation={massInvitation} />
    </TeamInvitationMeetingAbstract>
  )
}

export default InvitationLink
