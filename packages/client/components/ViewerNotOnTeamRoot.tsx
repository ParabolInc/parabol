import {Suspense} from 'react'
import viewerNotOnTeamQuery, {
  type ViewerNotOnTeamQuery
} from '../__generated__/ViewerNotOnTeamQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import {LoaderSize} from '../types/constEnums'
import {Loader} from '../utils/relay/renderLoader'
import ViewerNotOnTeam from './ViewerNotOnTeam'

const ViewerNotOnTeamRoot = () => {
  const searchParams = new URLSearchParams(location.search)
  const teamId = searchParams.get('teamId')
  const meetingId = searchParams.get('meetingId')
  const queryRef = useQueryLoaderNow<ViewerNotOnTeamQuery>(viewerNotOnTeamQuery, {
    teamId,
    meetingId
  })
  return (
    <Suspense fallback={<Loader size={LoaderSize.WHOLE_PAGE} />}>
      {queryRef && <ViewerNotOnTeam queryRef={queryRef} />}
    </Suspense>
  )
}

export default ViewerNotOnTeamRoot
