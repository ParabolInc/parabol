import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {TeamInvitationRootQuery} from '../__generated__/TeamInvitationRootQuery.graphql'
import TeamInvitationDialog from './TeamInvitationDialog'
import TeamInvitationMeetingAbstract from './TeamInvitationMeetingAbstract'
import TeamInvitationWrapper from './TeamInvitationWrapper'

interface Props {
  queryRef: PreloadedQuery<TeamInvitationRootQuery>
}

function TeamInvitation(props: Props) {
  const {queryRef} = props
  const data = usePreloadedQuery<TeamInvitationRootQuery>(
    graphql`
      query TeamInvitationRootQuery($token: ID!) {
        verifiedInvitation(token: $token) {
          ...TeamInvitationDialog_verifiedInvitation
          meetingType
        }
      }
    `,
    queryRef,
    {UNSTABLE_renderPolicy: 'full'}
  )

  const {verifiedInvitation} = data
  const {meetingType} = verifiedInvitation
  const Wrapper = meetingType ? TeamInvitationMeetingAbstract : TeamInvitationWrapper
  return (
    <Wrapper>
      <TeamInvitationDialog verifiedInvitation={verifiedInvitation} />
    </Wrapper>
  )
}

export default TeamInvitation
