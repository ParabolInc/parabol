import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {useFragment} from 'react-relay'
import type {TeamHealthIntroPhase_retroMeeting$key} from '~/__generated__/TeamHealthIntroPhase_retroMeeting.graphql'
import type {
  NewMeetingPhaseTypeEnum,
  TeamHealthPhaseContent_meeting$key
} from '~/__generated__/TeamHealthPhaseContent_meeting.graphql'
import lazyPreload, {type LazyPreloadedComponent} from '../../utils/lazyPreload'

const phaseLookup: Partial<Record<NewMeetingPhaseTypeEnum, LazyPreloadedComponent>> = {
  TEAM_HEALTH_INTRO: lazyPreload(
    () => import(/* webpackChunkName: 'TeamHealthIntroPhase' */ './TeamHealthIntroPhase')
  ),
  TEAM_HEALTH_RESPONSE: lazyPreload(
    () => import(/* webpackChunkName: 'TeamHealthResponsePhase' */ './TeamHealthResponsePhase')
  ),
  TEAM_HEALTH_RESULT: lazyPreload(
    () => import(/* webpackChunkName: 'TeamHealthResultPhase' */ './TeamHealthResultPhase')
  )
}

// the result phase is a waiting room until the owner reveals, which is the act of ending the meeting
const TeamHealthSubmittedPhase: LazyPreloadedComponent = lazyPreload(
  () => import(/* webpackChunkName: 'TeamHealthSubmittedPhase' */ './TeamHealthSubmittedPhase')
)

interface Props {
  meeting: TeamHealthPhaseContent_meeting$key
  gotoStageId: (stageId: string) => void
  // the retro the check shows in, if any
  retroMeeting?: TeamHealthIntroPhase_retroMeeting$key
}

const TeamHealthPhaseContent = (props: Props) => {
  const {meeting: meetingRef, gotoStageId, retroMeeting} = props
  const meeting = useFragment(
    graphql`
      fragment TeamHealthPhaseContent_meeting on TeamHealthMeeting {
        ...TeamHealthIntroPhase_meeting
        ...TeamHealthResponsePhase_meeting
        ...TeamHealthSubmittedPhase_meeting
        ...TeamHealthResultPhase_meeting
        endedAt
        localPhase {
          phaseType
        }
      }
    `,
    meetingRef
  )
  const {endedAt, localPhase} = meeting
  const localPhaseType = localPhase?.phaseType
  const isAwaitingReveal = localPhaseType === 'TEAM_HEALTH_RESULT' && !endedAt
  const Phase = isAwaitingReveal
    ? TeamHealthSubmittedPhase
    : localPhaseType
      ? phaseLookup[localPhaseType]
      : undefined
  return (
    <Suspense fallback={''}>
      {Phase && <Phase meeting={meeting} gotoStageId={gotoStageId} retroMeeting={retroMeeting} />}
    </Suspense>
  )
}

export default TeamHealthPhaseContent
