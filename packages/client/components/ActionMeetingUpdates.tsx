import {ActionMeetingUpdates_meeting} from '../__generated__/ActionMeetingUpdates_meeting.graphql'
import ms from 'ms'
import React, {useMemo} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {ActionMeetingPhaseProps} from './ActionMeeting'
import ActionMeetingUpdatesPrompt from './ActionMeetingUpdatesPrompt'
import BottomNavControl from './BottomNavControl'
import BottomNavIconLabel from './BottomNavIconLabel'
import MeetingContent from './MeetingContent'
import MeetingTopBar from './MeetingTopBar'
import MeetingPhaseWrapper from './MeetingPhaseWrapper'
import MeetingHelpToggle from './MenuHelpToggle'
import TaskColumns from './TaskColumns/TaskColumns'
import useAtmosphere from '../hooks/useAtmosphere'
import useTimeout from '../hooks/useTimeout'
import MeetingFacilitatorBar from '../modules/meeting/components/MeetingControlBar/MeetingFacilitatorBar'
import {AreaEnum, IUpdatesStage, NewMeetingPhaseTypeEnum} from '../types/graphql'
import handleRightArrow from '../utils/handleRightArrow'
import isTaskPrivate from '../utils/isTaskPrivate'
import lazyPreload from '../utils/lazyPreload'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import toTeamMemberId from '../utils/relay/toTeamMemberId'
import EndMeetingButton from './EndMeetingButton'
import findStageAfterId from '../utils/meetings/findStageAfterId'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import PhaseWrapper from './PhaseWrapper'

const BottomControlSpacer = styled('div')({
  minWidth: 90
})

const StyledColumnsWrapper = styled(MeetingPhaseWrapper)({
  position: 'relative'
})

/* InnerColumnsWrapper is a patch fix to ensure correct
   behavior for task columns overflow in small viewports TA */
const InnerColumnsWrapper = styled('div')({
  display: 'flex',
  overflow: 'auto',
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
})

interface Props extends ActionMeetingPhaseProps {
  meeting: ActionMeetingUpdates_meeting
}

const UpdatesHelpMenu = lazyPreload(async () =>
  import(/* webpackChunkName: 'UpdatesHelpMenu' */ './MeetingHelp/UpdatesHelpMenu')
)

const ActionMeetingUpdates = (props: Props) => {
  const {avatarGroup, toggleSidebar, meeting, handleGotoNext} = props
  const atmosphere = useAtmosphere()
  const {gotoNext, ref: gotoNextRef} = handleGotoNext
  const minTimeComplete = useTimeout(ms('2m'))
  const {viewerId} = atmosphere
  const {endedAt, facilitatorUserId, id: meetingId, localStage, phases, showSidebar, team} = meeting
  const {id: teamId, tasks} = team
  const {id: localStageId, teamMember} = localStage!
  const {userId} = teamMember!
  const teamMemberTasks = useMemo(() => {
    return tasks.edges
      .map(({node}) => node)
      .filter((task) => task.userId === userId && !isTaskPrivate(task.tags))
  }, [tasks, userId])
  const stageRes = findStageAfterId(phases, localStageId)
  if (!stageRes) return null
  const {phase: nextPhase, stage: nextStage} = stageRes
  const label =
    nextPhase.phaseType === NewMeetingPhaseTypeEnum.updates
      ? (nextStage as IUpdatesStage).teamMember.preferredName
      : phaseLabelLookup[nextPhase.phaseType]

  const isFacilitating = facilitatorUserId === viewerId && !endedAt
  return (
    <MeetingContent>
      <MeetingHeaderAndPhase>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          toggleSidebar={toggleSidebar}
        >
          <ActionMeetingUpdatesPrompt meeting={meeting} />
        </MeetingTopBar>
        <PhaseWrapper>
          <StyledColumnsWrapper>
            <InnerColumnsWrapper>
              <TaskColumns
                area={AreaEnum.meeting}
                isMyMeetingSection={userId === viewerId}
                meetingId={meetingId}
                myTeamMemberId={toTeamMemberId(teamId, viewerId)}
                tasks={teamMemberTasks}
                teams={null}
              />
            </InnerColumnsWrapper>
          </StyledColumnsWrapper>
        </PhaseWrapper>
        <MeetingHelpToggle menu={<UpdatesHelpMenu />} />
      </MeetingHeaderAndPhase>
      <MeetingFacilitatorBar isFacilitating={isFacilitating}>
        <BottomControlSpacer />
        <BottomNavControl
          isBouncing={minTimeComplete}
          onClick={() => gotoNext()}
          onKeyDown={handleRightArrow(() => gotoNext())}
          ref={gotoNextRef}
        >
          <BottomNavIconLabel icon='arrow_forward' iconColor='warm' label={`Next: ${label}`} />
        </BottomNavControl>
        <EndMeetingButton meetingId={meetingId} isEnded={!!endedAt} />
      </MeetingFacilitatorBar>
    </MeetingContent>
  )
}

graphql`
  fragment ActionMeetingUpdatesStage on UpdatesStage {
    teamMember {
      id
      userId
      preferredName
    }
  }
`

export default createFragmentContainer(ActionMeetingUpdates, {
  meeting: graphql`
    fragment ActionMeetingUpdates_meeting on ActionMeeting {
      ...ActionMeetingUpdatesPrompt_meeting
      endedAt
      showSidebar
      id
      facilitatorUserId
      localStage {
        ...ActionMeetingUpdatesStage @relay(mask: false)
        id
        isComplete
      }
      phases {
        phaseType
        stages {
          id
          ...ActionMeetingUpdatesStage @relay(mask: false)
        }
      }
      team {
        id
        tasks(first: 1000) @connection(key: "TeamColumnsContainer_tasks") {
          edges {
            node {
              ...TaskColumns_tasks
              # grab these so we can sort correctly
              id
              status
              sortOrder
              tags
              assignee {
                id
              }
              userId
            }
          }
        }
      }
    }
  `
})
