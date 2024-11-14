import {Suspense} from 'react'
import teamSettingsQuery, {
  TeamSettingsQuery
} from '../../../__generated__/TeamSettingsQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import {LoaderSize} from '../../../types/constEnums'
import {Loader} from '../../../utils/relay/renderLoader'
import TeamSettings from './TeamSettings/TeamSettings'

interface Props {
  teamId: string
}

const TeamSettingsRoot = ({teamId}: Props) => {
  const queryRef = useQueryLoaderNow<TeamSettingsQuery>(teamSettingsQuery, {teamId})
  return (
    <Suspense fallback={<Loader size={LoaderSize.PANEL} />}>
      {queryRef && <TeamSettings queryRef={queryRef} />}
    </Suspense>
  )
}

export default TeamSettingsRoot
