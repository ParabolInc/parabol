import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {useFragment} from 'react-relay'
import type {NewMeetingPhaseTypeEnum} from '~/__generated__/RetroMeeting_meeting.graphql'
import type {TeamHealthMeeting_meeting$key} from '~/__generated__/TeamHealthMeeting_meeting.graphql'
import useMeeting from '../hooks/useMeeting'
import lazyPreload, {type LazyPreloadedComponent} from '../utils/lazyPreload'
import MeetingLockedOverlay from './MeetingLockedOverlay'
import MeetingStyles from './MeetingStyles'

interface Props {
  meeting: TeamHealthMeeting_meeting$key
}

const phaseLookup: Partial<Record<NewMeetingPhaseTypeEnum, LazyPreloadedComponent>> = {
  TEAM_HEALTH_INTRO: lazyPreload(
    () => import(/* webpackChunkName: 'TeamHealthIntroPhase' */ './TeamHealth/TeamHealthIntroPhase')
  ),
  TEAM_HEALTH_RESPONSE: lazyPreload(
    () =>
      import(
        /* webpackChunkName: 'TeamHealthResponsePhase' */ './TeamHealth/TeamHealthResponsePhase'
      )
  ),
  TEAM_HEALTH_SUBMITTED: lazyPreload(
    () =>
      import(
        /* webpackChunkName: 'TeamHealthSubmittedPhase' */ './TeamHealth/TeamHealthSubmittedPhase'
      )
  ),
  TEAM_HEALTH_RESULT: lazyPreload(
    () =>
      import(/* webpackChunkName: 'TeamHealthResultPhase' */ './TeamHealth/TeamHealthResultPhase')
  )
}

const TeamHealthMeeting = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment TeamHealthMeeting_meeting on TeamHealthMeeting {
        ...useMeeting_meeting
        ...MeetingLockedOverlay_meeting
        ...TeamHealthIntroPhase_meeting
        ...TeamHealthResponsePhase_meeting
        ...TeamHealthSubmittedPhase_meeting
        ...TeamHealthResultPhase_meeting
        id
        localPhase {
          phaseType
        }
      }
    `,
    meetingRef
  )
  const {gotoStageId, safeRoute} = useMeeting(meeting)
  if (!safeRoute) return null
  const localPhaseType = meeting.localPhase?.phaseType as NewMeetingPhaseTypeEnum | undefined
  const Phase = localPhaseType ? phaseLookup[localPhaseType] : undefined
  return (
    <MeetingStyles>
      <div className='h-full w-full overflow-auto'>
        <Suspense fallback={''}>
          {Phase && <Phase meeting={meeting} gotoStageId={gotoStageId} />}
        </Suspense>
      </div>
      <MeetingLockedOverlay meetingRef={meeting} />
    </MeetingStyles>
  )
}

export default TeamHealthMeeting
