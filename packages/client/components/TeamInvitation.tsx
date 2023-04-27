import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {TeamInvitationQuery} from '../__generated__/TeamInvitationQuery.graphql'
import TeamInvitationDialog from './TeamInvitationDialog'
import TeamInvitationMeetingAbstract from './TeamInvitationMeetingAbstract'
import TeamInvitationWrapper from './TeamInvitationWrapper'

interface Props {
  queryRef: PreloadedQuery<TeamInvitationQuery>
}

const query = graphql`
  query TeamInvitationQuery($token: ID!) {
    verifiedInvitation(token: $token) {
      ...TeamInvitationDialog_verifiedInvitation
      meetingType
    }
  }
`
function TeamInvitation(props: Props) {
  const {queryRef} = props
  const data = usePreloadedQuery<TeamInvitationQuery>(query, queryRef)

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
