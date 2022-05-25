import React, {Suspense} from 'react'
import TeamArchive from '~/modules/teamDashboard/components/TeamArchive/TeamArchive'
import UserTasksHeader from '~/modules/userDashboard/components/UserTasksHeader/UserTasksHeader'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import teamArchiveQuery, {TeamArchiveQuery} from '../__generated__/TeamArchiveQuery.graphql'

interface Props {
  teamIds?: string[] | null
  userIds?: string[] | null
}

const ArchiveTaskUserRoot = ({teamIds, userIds}: Props) => {
  const queryRef = useQueryLoaderNow<TeamArchiveQuery>(teamArchiveQuery, {
    userIds,
    teamIds,
    first: 40
  })

  return (
    <Suspense fallback={<UserTasksHeader viewerRef={null} />}>
      {queryRef && <TeamArchive queryRef={queryRef} />}
    </Suspense>
  )
}

export default ArchiveTaskUserRoot
