import {ActionMeetingUpdates_team} from '__generated__/ActionMeetingUpdates_team.graphql'
import ms from 'ms'
import React, {useMemo} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import {ActionMeetingPhaseProps} from 'universal/components/ActionMeeting'
import ActionMeetingUpdatesPrompt from 'universal/components/ActionMeetingUpdatesPrompt'
import BottomNavControl from 'universal/components/BottomNavControl'
import BottomNavIconLabel from 'universal/components/BottomNavIconLabel'
import ErrorBoundary from 'universal/components/ErrorBoundary'
import MeetingContent from 'universal/components/MeetingContent'
import MeetingContentHeader from 'universal/components/MeetingContentHeader'
import MeetingPhaseWrapper from 'universal/components/MeetingPhaseWrapper'
import MeetingHelpToggle from 'universal/components/MenuHelpToggle'
import TaskColumns from 'universal/components/TaskColumns/TaskColumns'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import useTimeout from 'universal/hooks/useTimeout'
import MeetingControlBar from 'universal/modules/meeting/components/MeetingControlBar/MeetingControlBar'
import {AreaEnum, NewMeetingPhaseTypeEnum} from 'universal/types/graphql'
import getTaskById from 'universal/utils/getTaskById'
import handleRightArrow from 'universal/utils/handleRightArrow'
import isTaskPrivate from 'universal/utils/isTaskPrivate'
import lazyPreload from 'universal/utils/lazyPreload'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'
import EndMeetingButton from './EndMeetingButton'

const BottomControlSpacer = styled('div')({
  minWidth: '6rem'
})

const StyledBottomBar = styled(MeetingControlBar)({
  justifyContent: 'space-between'
})

interface Props extends ActionMeetingPhaseProps {
  team: ActionMeetingUpdates_team
}

const UpdatesHelpMenu = lazyPreload(async () =>
  import(/* webpackChunkName: 'UpdatesHelpMenu' */ 'universal/components/MeetingHelp/UpdatesHelpMenu')
)

const ActionMeetingUpdates = (props: Props) => {
  const {avatarGroup, toggleSidebar, team, handleGotoNext} = props
  const atmosphere = useAtmosphere()
  const {gotoNext, ref: gotoNextRef} = handleGotoNext
  const minTimeComplete = useTimeout(ms('2m'))
  const {viewerId} = atmosphere
  const {id: teamId, isMeetingSidebarCollapsed, newMeeting, tasks} = team
  const {facilitatorUserId, id: meetingId, localStage} = newMeeting!
  const {teamMember} = localStage!
  const {userId} = teamMember!
  const teamMemberTasks = useMemo(() => {
    return {
      ...tasks,
      edges: tasks.edges.filter(({node}) => node.userId === userId && !isTaskPrivate(node.tags))
    }
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
        <MeetingPhaseWrapper>
          <TaskColumns
            area={AreaEnum.meeting}
            getTaskById={getTaskById(teamMemberTasks)}
            isMyMeetingSection={userId === viewerId}
            meetingId={meetingId}
            myTeamMemberId={toTeamMemberId(teamId, viewerId)}
            tasks={teamMemberTasks}
          />
        </MeetingPhaseWrapper>
        {isFacilitating && (
          <StyledBottomBar>
            <BottomControlSpacer />
            <BottomNavControl
              isBouncing={minTimeComplete}
              onClick={() => gotoNext()}
              onKeyDown={handleRightArrow(() => gotoNext())}
              innerRef={gotoNextRef}
            >
              <BottomNavIconLabel
                icon='arrow_forward'
                iconColor='warm'
                label={`Next: ${phaseLabelLookup[NewMeetingPhaseTypeEnum.agendaitems]}`}
              />
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
    }
  }
`

export default createFragmentContainer(
  ActionMeetingUpdates,
  graphql`
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
            stages {
              id
              ...ActionMeetingUpdatesStage @relay(mask: false)
            }
          }
        }
      }
      tasks(first: 1000) @connection(key: "TeamColumnsContainer_tasks") {
        ...TaskColumns_tasks
        edges {
          node {
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
)
