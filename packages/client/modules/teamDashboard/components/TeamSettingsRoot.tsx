import React, {Suspense} from 'react'
import TeamSettings from './TeamSettings/TeamSettings'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import teamSettingsQuery, {
  TeamSettingsQuery
} from '../../../__generated__/TeamSettingsQuery.graphql'

interface Props {
  teamId: string
}

const TeamSettingsRoot = ({teamId}: Props) => {
  const queryRef = useQueryLoaderNow<TeamSettingsQuery>(teamSettingsQuery, {teamId})
  return <Suspense fallback={''}>{queryRef && <TeamSettings queryRef={queryRef} />}</Suspense>
}

export default TeamSettingsRoot
