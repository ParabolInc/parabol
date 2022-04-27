import React, {Suspense} from 'react'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import {LoaderSize} from '../../../types/constEnums'
import {renderLoader} from '../../../utils/relay/renderLoader'
import teamSettingsQuery, {
  TeamSettingsQuery
} from '../../../__generated__/TeamSettingsQuery.graphql'
import TeamSettings from './TeamSettings/TeamSettings'

interface Props {
  teamId: string
}

const TeamSettingsRoot = ({teamId}: Props) => {
  const queryRef = useQueryLoaderNow<TeamSettingsQuery>(teamSettingsQuery, {teamId})
  return (
    <Suspense fallback={renderLoader({size: LoaderSize.PANEL})}>
      {queryRef && <TeamSettings queryRef={queryRef} />}
    </Suspense>
  )
}

export default TeamSettingsRoot
