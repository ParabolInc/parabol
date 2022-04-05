import React, {Suspense} from 'react'
import TeamSettings from './TeamSettings/TeamSettings'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import teamSettingsQuery, {
  TeamSettingsQuery
} from '../../../__generated__/TeamSettingsQuery.graphql'
import {renderLoader} from '../../../utils/relay/renderLoader'
import {LoaderSize} from '../../../types/constEnums'

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
