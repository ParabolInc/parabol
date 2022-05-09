import graphql from 'babel-plugin-relay/macro'
import React, {Suspense} from 'react'
import {useFragment} from 'react-relay'
import useGotoStageId from '../hooks/useGotoStageId'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import pokerEstimatePhaseQuery, {
  PokerEstimatePhaseQuery
} from '../__generated__/PokerEstimatePhaseQuery.graphql'
import PokerEstimatePhase from './PokerEstimatePhase'
import {PokerMeetingPhaseProps} from './PokerMeeting'

interface Props extends PokerMeetingPhaseProps {
  gotoStageId: ReturnType<typeof useGotoStageId>
  meeting: any // TODO: update
}

const PokerEstimatePhaseRoot = (props: Props) => {
  const {avatarGroup, meeting: meetingRef, toggleSidebar, gotoStageId} = props
  const meeting = useFragment(
    graphql`
      fragment PokerEstimatePhaseRoot_meeting on PokerMeeting {
        id
      }
    `,
    meetingRef
  )
  const {id: meetingId} = meeting
  const queryRef = useQueryLoaderNow<PokerEstimatePhaseQuery>(pokerEstimatePhaseQuery, {meetingId})

  return (
    <Suspense fallback={''}>
      {queryRef && (
        <PokerEstimatePhase
          queryRef={queryRef}
          gotoStageId={gotoStageId}
          toggleSidebar={toggleSidebar}
          avatarGroup={avatarGroup}
        />
      )}
    </Suspense>
  )
}
export default PokerEstimatePhaseRoot
