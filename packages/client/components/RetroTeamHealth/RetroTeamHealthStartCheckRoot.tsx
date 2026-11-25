import {Suspense} from 'react'
import retroTeamHealthStartCheckQuery, {
  type RetroTeamHealthStartCheckQuery
} from '../../__generated__/RetroTeamHealthStartCheckQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import RetroTeamHealthStartCheck from './RetroTeamHealthStartCheck'

interface Props {
  retroMeetingId: string
  teamId: string
}

const RetroTeamHealthStartCheckRoot = (props: Props) => {
  const {retroMeetingId, teamId} = props
  const queryRef = useQueryLoaderNow<RetroTeamHealthStartCheckQuery>(retroTeamHealthStartCheckQuery)
  return (
    <Suspense fallback={''}>
      {queryRef && (
        <RetroTeamHealthStartCheck
          queryRef={queryRef}
          retroMeetingId={retroMeetingId}
          teamId={teamId}
        />
      )}
    </Suspense>
  )
}

export default RetroTeamHealthStartCheckRoot
