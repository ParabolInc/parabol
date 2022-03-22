import React, {Suspense} from 'react'
import {RouteComponentProps} from 'react-router'
import teamInvitationQuery, {
  TeamInvitationRootQuery
} from '~/__generated__/TeamInvitationRootQuery.graphql'
import useNoIndex from '~/hooks/useNoIndex'
import {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import TeamInvitation from './TeamInvitation'

interface Props extends WithAtmosphereProps, RouteComponentProps<{token: string}> {}

const TeamInvitationRoot = (props: Props) => {
  useNoIndex()
  const {match} = props
  const {params} = match
  const {token} = params
  const queryRef = useQueryLoaderNow<TeamInvitationRootQuery>(teamInvitationQuery, {token})
  return <Suspense fallback={''}>{queryRef && <TeamInvitation queryRef={queryRef} />}</Suspense>
}

export default TeamInvitationRoot
