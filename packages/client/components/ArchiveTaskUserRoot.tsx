import {Suspense} from 'react'
import TeamArchive from '~/modules/teamDashboard/components/TeamArchive/TeamArchive'
import UserTasksHeader from '~/modules/userDashboard/components/UserTasksHeader/UserTasksHeader'
import teamArchiveQuery, {TeamArchiveQuery} from '../__generated__/TeamArchiveQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'

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
