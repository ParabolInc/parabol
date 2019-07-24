import {ActionMeetingUpdates_team} from '../../__generated__/ActionMeetingUpdates_team.graphql'
import ms from 'ms'
import React, {useMemo} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer, graphql} from 'react-relay'
import {ActionMeetingPhaseProps} from './ActionMeeting'
import ActionMeetingUpdatesPrompt from './ActionMeetingUpdatesPrompt'
import BottomNavControl from './BottomNavControl'
import BottomNavIconLabel from './BottomNavIconLabel'
import ErrorBoundary from './ErrorBoundary'
import MeetingContent from './MeetingContent'
import MeetingContentHeader from './MeetingContentHeader'
import MeetingPhaseWrapper from './MeetingPhaseWrapper'
import MeetingHelpToggle from './MenuHelpToggle'
import TaskColumns from './TaskColumns/TaskColumns'
import useAtmosphere from '../hooks/useAtmosphere'
import useTimeout from '../hooks/useTimeout'
import MeetingControlBar from '../modules/meeting/components/MeetingControlBar/MeetingControlBar'
import {AreaEnum, IUpdatesStage, NewMeetingPhaseTypeEnum} from '../types/graphql'
import getTaskById from '../utils/getTaskById'
import handleRightArrow from '../utils/handleRightArrow'
import isTaskPrivate from '../utils/isTaskPrivate'
import lazyPreload from '../utils/lazyPreload'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import toTeamMemberId from '../utils/relay/toTeamMemberId'
import EndMeetingButton from './EndMeetingButton'
import findStageAfterId from '../utils/meetings/findStageAfterId'

const BottomControlSpacer = styled('div')({
  minWidth: '6rem'
})

const StyledBottomBar = styled(MeetingControlBar)({
  justifyContent: 'space-between'
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
  team: ActionMeetingUpdates_team
}

const UpdatesHelpMenu = lazyPreload(async () =>
  import(
    /* webpackChunkName: 'UpdatesHelpMenu' */ './MeetingHelp/UpdatesHelpMenu'
  )
)

const ActionMeetingUpdates = (props: Props) => {
  const {avatarGroup, toggleSidebar, team, handleGotoNext} = props
  const atmosphere = useAtmosphere()
  const {gotoNext, ref: gotoNextRef} = handleGotoNext
  const minTimeComplete = useTimeout(ms('2m'))
  const {viewerId} = atmosphere
  const {id: teamId, isMeetingSidebarCollapsed, newMeeting, tasks} = team
  const {facilitatorUserId, id: meetingId, localStage, phases} = newMeeting!
  const {id: localStageId, teamMember} = localStage!
  const {userId} = teamMember!
  const stageRes = findStageAfterId(phases, localStageId)
  if (!stageRes) return null
  const {phase: nextPhase, stage: nextStage} = stageRes
  const label =
    nextPhase.phaseType === NewMeetingPhaseTypeEnum.updates
      ? (nextStage as IUpdatesStage).teamMember.preferredName
      : phaseLabelLookup[nextPhase.phaseType]
  const teamMemberTasks = useMemo(() => {
    return tasks.edges
      .map(({node}) => node)
      .filter((task) => task.userId === userId && !isTaskPrivate(task.tags))
  }, [tasks, userId])
  const isFacilitating = facilitatorUserId === viewerId
  return (
    <MeetingContent>
      <MeetingContentHeader
        avatarGroup={avatarGroup}
        isMeetingSidebarCollapsed={!!isMeetingSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      >
        <ActionMeetingUpdatesPrompt team={team} />
      </MeetingContentHeader>
      <ErrorBoundary>
        <StyledColumnsWrapper>
          <InnerColumnsWrapper>
            <TaskColumns
              area={AreaEnum.meeting}
              getTaskById={getTaskById(teamMemberTasks)}
              isMyMeetingSection={userId === viewerId}
              meetingId={meetingId}
              myTeamMemberId={toTeamMemberId(teamId, viewerId)}
              tasks={teamMemberTasks}
            />
          </InnerColumnsWrapper>
        </StyledColumnsWrapper>
        {isFacilitating && (
          <StyledBottomBar>
            <BottomControlSpacer />
            <BottomNavControl
              isBouncing={minTimeComplete}
              onClick={() => gotoNext()}
              onKeyDown={handleRightArrow(() => gotoNext())}
              ref={gotoNextRef}
            >
              <BottomNavIconLabel icon='arrow_forward' iconColor='warm' label={`Next: ${label}`} />
            </BottomNavControl>
            <EndMeetingButton meetingId={meetingId} />
          </StyledBottomBar>
        )}
      </ErrorBoundary>
      <MeetingHelpToggle floatAboveBottomBar={isFacilitating} menu={<UpdatesHelpMenu />} />
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
  team: graphql`
    fragment ActionMeetingUpdates_team on Team {
      ...ActionMeetingUpdatesPrompt_team
      id
      isMeetingSidebarCollapsed
      newMeeting {
        ...PhaseItemColumn_meeting
        id
        facilitatorUserId
        ... on ActionMeeting {
          localStage {
            isComplete
          }
          localStage {
            id
            ...ActionMeetingUpdatesStage @relay(mask: false)
          }
          phases {
            phaseType
            stages {
              id
              ...ActionMeetingUpdatesStage @relay(mask: false)
            }
          }
        }
      }
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
  `
})
