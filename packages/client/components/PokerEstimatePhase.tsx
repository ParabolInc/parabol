import React, {useRef} from 'react'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingTopBar from './MeetingTopBar'
import PhaseHeaderDescription from './PhaseHeaderDescription'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import PhaseWrapper from './PhaseWrapper'
import EstimatePhaseArea from './EstimatePhaseArea'
import PokerEstimateHeaderCard from './PokerEstimateHeaderCard'
import EstimatePhaseEmptyState from './EstimatePhaseEmptyState'

const PokerEstimatePhase = (props: any) => {
  const {avatarGroup, toggleSidebar, meeting} = props
  const phaseRef = useRef<HTMLDivElement>(null)
  const {localPhase, endedAt, showSidebar} = meeting
  const isEmpty = false
  if (!localPhase) return null
  return (
    <MeetingContent ref={phaseRef}>
      <MeetingHeaderAndPhase hideBottomBar={!!endedAt}>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          toggleSidebar={toggleSidebar}
        >
          <PhaseHeaderTitle>{phaseLabelLookup.ESTIMATE}</PhaseHeaderTitle>
          <PhaseHeaderDescription>{'Estimate each story as a team'}</PhaseHeaderDescription>
        </MeetingTopBar>
        {isEmpty ? (
          <EstimatePhaseEmptyState teamId={'dummyId'} />
        ) : (
          <>
            <PokerEstimateHeaderCard />
            <PhaseWrapper>
              <EstimatePhaseArea />
            </PhaseWrapper>
          </>
        )}
      </MeetingHeaderAndPhase>
    </MeetingContent>
  )
}

export default PokerEstimatePhase
