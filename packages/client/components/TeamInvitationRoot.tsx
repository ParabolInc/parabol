import React, {Suspense} from 'react'
import {RouteComponentProps} from 'react-router'
import useNoIndex from '~/hooks/useNoIndex'
import teamInvitationQuery, {TeamInvitationQuery} from '~/__generated__/TeamInvitationQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import TeamInvitation from './TeamInvitation'

interface Props extends RouteComponentProps<{token: string}> {}

const TeamInvitationRoot = (props: Props) => {
  useNoIndex()
  const {match} = props
  const {params} = match
  const {token} = params
  const queryRef = useQueryLoaderNow<TeamInvitationQuery>(teamInvitationQuery, {token})
  return <Suspense fallback={''}>{queryRef && <TeamInvitation queryRef={queryRef} />}</Suspense>
}

export default TeamInvitationRoot
