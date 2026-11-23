import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate, useFragment} from 'react-relay'
import type {RetroSidebarTeamHealthCheckSection_meeting$key} from '~/__generated__/RetroSidebarTeamHealthCheckSection_meeting.graphql'
import useAnimatedPhaseListChildren from '../../hooks/useAnimatedPhaseListChildren'
import useAtmosphere from '../../hooks/useAtmosphere'
import type useGotoStageId from '../../hooks/useGotoStageId'
import {cn} from '../../ui/cn'
import {setLocalStageAndPhase} from '../../utils/relay/updateLocalStage'
import MeetingSidebarPhaseItemChild from '../MeetingSidebarPhaseItemChild'
import TeamHealthSidebarQuestionSection from '../TeamHealth/TeamHealthSidebarQuestionSection'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  meeting: RetroSidebarTeamHealthCheckSection_meeting$key
}

const RetroSidebarTeamHealthCheckSection = (props: Props) => {
  const {gotoStageId, handleMenuClick, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment RetroSidebarTeamHealthCheckSection_meeting on RetrospectiveMeeting {
        localPhase {
          phaseType
        }
        phases {
          phaseType
          stages {
            id
          }
        }
        openTeamHealthMeeting {
          id
          endedAt
          phases {
            phaseType
            stages {
              id
            }
          }
          ...TeamHealthSidebarQuestionSection_meeting
        }
      }
    `,
    meetingRef
  )
  const atmosphere = useAtmosphere()
  const checkStage = meeting.phases.find(({phaseType}) => phaseType === 'TEAM_HEALTH_CHECK')
    ?.stages[0]
  const openCheck = meeting.openTeamHealthMeeting
  const teamHealthMeeting = openCheck && !openCheck.endedAt ? openCheck : null
  const questionCount =
    teamHealthMeeting?.phases.find(({phaseType}) => phaseType === 'TEAM_HEALTH_RESPONSE')?.stages
      .length ?? 0
  const isActive = meeting.localPhase?.phaseType === 'TEAM_HEALTH_CHECK'
  const {height, ref} = useAnimatedPhaseListChildren(isActive, questionCount)
  const gotoQuestion = (questionStageId: string) => {
    if (!checkStage || !teamHealthMeeting) return Promise.resolve()
    commitLocalUpdate(atmosphere, (store) =>
      setLocalStageAndPhase(store, teamHealthMeeting.id, questionStageId)
    )
    return gotoStageId(checkStage.id)
  }
  return (
    <MeetingSidebarPhaseItemChild minHeight={height} height={height}>
      <div
        className={cn(
          'flex h-full w-full flex-col',
          isActive ? 'overflow-auto' : 'overflow-hidden'
        )}
        ref={ref}
      >
        {teamHealthMeeting && (
          <TeamHealthSidebarQuestionSection
            gotoStageId={gotoQuestion}
            handleMenuClick={handleMenuClick}
            meeting={teamHealthMeeting}
          />
        )}
      </div>
    </MeetingSidebarPhaseItemChild>
  )
}

export default RetroSidebarTeamHealthCheckSection
