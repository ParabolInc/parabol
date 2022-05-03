import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {InvitationLinkQuery} from '../__generated__/InvitationLinkQuery.graphql'
import TeamInvitationMeetingAbstract from './TeamInvitationMeetingAbstract'
import InvitationLinkDialog from './InvitationLinkDialog'

interface Props {
  queryRef: PreloadedQuery<InvitationLinkQuery>
}

const query = graphql`
  query InvitationLinkQuery($token: ID!) {
    massInvitation(token: $token) {
      ...InvitationLinkDialog_massInvitation
    }
  }
`

function InvitationLink(props: Props) {
  const {queryRef} = props
  const data = usePreloadedQuery<InvitationLinkQuery>(query, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })
  const {massInvitation} = data
  // the meeting background is prettier than the plain one, so let's always use it
  return (
    <TeamInvitationMeetingAbstract>
      <InvitationLinkDialog massInvitation={massInvitation} />
    </TeamInvitationMeetingAbstract>
  )
}

export default InvitationLink
