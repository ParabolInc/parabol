import React, {Suspense} from 'react'
import {PreloadedQuery} from 'react-relay'
import TeamArchive from '~/modules/teamDashboard/components/TeamArchive/TeamArchive'
import UserTasksHeader from '~/modules/userDashboard/components/UserTasksHeader/UserTasksHeader'
import {TeamArchiveQuery} from '../__generated__/TeamArchiveQuery.graphql'

interface Props {
  prepared: {
    queryRef: PreloadedQuery<TeamArchiveQuery>
  }
}

const ArchiveTaskUserRoot = (props: Props) => {
  const {queryRef} = props.prepared
  return (
    <Suspense fallback={<UserTasksHeader viewerRef={null} />}>
      {queryRef && <TeamArchive queryRef={queryRef} />}
    </Suspense>
  )
}

export default ArchiveTaskUserRoot
