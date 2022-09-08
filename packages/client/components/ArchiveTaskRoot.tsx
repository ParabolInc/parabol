import React, {Suspense} from 'react'
import {useTranslation} from 'react-i18next'
import useDocumentTitle from '~/hooks/useDocumentTitle'
import TeamArchive from '~/modules/teamDashboard/components/TeamArchive/TeamArchive'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import teamArchiveQuery, {TeamArchiveQuery} from '../__generated__/TeamArchiveQuery.graphql'

interface Props {
  teamIds?: string[] | null
  userIds?: string[] | null
  team: any
  returnToTeamId: string
}

const ArchiveTaskRoot = ({teamIds, team, userIds, returnToTeamId}: Props) => {
  const {t} = useTranslation()

  useDocumentTitle(
    t('ArchiveTaskRoot.TeamArchiveTeamName', {
      teamName: team.name
    }),
    t('ArchiveTaskRoot.Archive')
  )

  const queryRef = useQueryLoaderNow<TeamArchiveQuery>(teamArchiveQuery, {
    userIds,
    teamIds,
    first: 40
  })

  return (
    <Suspense fallback={''}>
      {queryRef && (
        <TeamArchive returnToTeamId={returnToTeamId} teamRef={team} queryRef={queryRef} />
      )}
    </Suspense>
  )
}

export default ArchiveTaskRoot
