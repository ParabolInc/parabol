import ms from 'ms'
import React, {useMemo} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import {ActionMeetingPhaseProps} from 'universal/components/ActionMeeting'
import BottomNavControl from 'universal/components/BottomNavControl'
import BottomNavIconLabel from 'universal/components/BottomNavIconLabel'
import ErrorBoundary from 'universal/components/ErrorBoundary'
import MeetingContent from 'universal/components/MeetingContent'
import MeetingContentHeader from 'universal/components/MeetingContentHeader'
import MeetingHelpToggle from 'universal/components/MenuHelpToggle'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import useTimeout from 'universal/hooks/useTimeout'
import MeetingControlBar from 'universal/modules/meeting/components/MeetingControlBar/MeetingControlBar'
import MeetingCopy from 'universal/modules/meeting/components/MeetingCopy/MeetingCopy'
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading'
import handleRightArrow from 'universal/utils/handleRightArrow'
import lazyPreload from 'universal/utils/lazyPreload'
import EndMeetingButton from './EndMeetingButton'
import {ActionMeetingAgendaItems_team} from '__generated__/ActionMeetingAgendaItems_team.graphql'
import Avatar from 'universal/components/Avatar/Avatar'
import MeetingAgendaCards from 'universal/modules/meeting/components/MeetingAgendaCards/MeetingAgendaCards'
import EditorHelpModalContainer from 'universal/containers/EditorHelpModalContainer/EditorHelpModalContainer'
import findStageAfterId from 'universal/utils/meetings/findStageAfterId'
import {NewMeetingPhaseTypeEnum} from 'universal/types/graphql'

const BottomControlSpacer = styled('div')({
  minWidth: '6rem'
})

const StyledBottomBar = styled(MeetingControlBar)({
  justifyContent: 'space-between'
})

interface Props extends ActionMeetingPhaseProps {
  team: ActionMeetingAgendaItems_team
}

const ActionMeetingAgendaItemsHelpMenu = lazyPreload(async () =>
  import(/* webpackChunkName: 'ActionMeetingAgendaItemsHelpMenu' */ 'universal/components/MeetingHelp/ActionMeetingAgendaItemsHelpMenu')
)

const AgendaItemsWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%'
})

const AgendaVerbatim = styled('div')({
  alignItems: 'center',
  display: 'flex',
  margin: '0 auto'
})

const StyledHeading = styled(MeetingPhaseHeading)({
  marginLeft: 16,
  fontSize: 24
})

const StyledCopy = styled(MeetingCopy)({
  margin: '16px 0 0'
})

const TaskCardBlock = styled('div')({
  display: 'flex',
  flex: 1,
  margin: '0 auto',
  position: 'relative',
  width: '100%'
})

const Inner = styled('div')({
  display: 'flex',
  overflow: 'auto',
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
})

const Inception = styled('div')({
  flex: 1,
  margin: '0 auto',
  maxWidth: 296 * 4 + 16 * 5,
  height: '100%',
  padding: 16
})

const ActionMeetingAgendaItems = (props: Props) => {
  const {avatarGroup, toggleSidebar, team, handleGotoNext} = props
  const atmosphere = useAtmosphere()
  const {gotoNext, ref: gotoNextRef} = handleGotoNext
  const minTimeComplete = useTimeout(ms('2m'))
  const {viewerId} = atmosphere
  const {agendaItems, isMeetingSidebarCollapsed, newMeeting, tasks} = team
  const {facilitatorUserId, id: meetingId, localStage, phases} = newMeeting!
  const {id: localStageId, agendaItemId} = localStage
  const agendaTasks = useMemo(() => {
    return tasks.edges
      .map(({node}) => node)
      .filter((node) => node.agendaId === agendaItemId)
      .sort((a, b) => (a.sortOrder < b.sortOrder ? 1 : -1))
  }, [agendaItemId, tasks])
  const agendaItem = agendaItems.find((item) => item.id === agendaItemId!)
  // optimistic updater could remove the agenda item
  if (!agendaItem) return null
  const {content, teamMember} = agendaItem
  const {picture, preferredName} = teamMember
  const isFacilitating = facilitatorUserId === viewerId
  const nextStageRes = findStageAfterId(phases, localStageId)
  const {phase: nextPhase} = nextStageRes!
  const label =
    nextPhase.phaseType === NewMeetingPhaseTypeEnum.lastcall ? 'Last Call' : 'Next Topic'
  return (
    <MeetingContent>
      <MeetingContentHeader
        avatarGroup={avatarGroup}
        isMeetingSidebarCollapsed={!!isMeetingSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />
      <ErrorBoundary>
        <AgendaItemsWrapper>
          <AgendaVerbatim>
            <Avatar picture={picture} size={64} />
            <StyledHeading>{content}</StyledHeading>
          </AgendaVerbatim>
          <StyledCopy>{`${preferredName}, what do you need?`}</StyledCopy>
          <TaskCardBlock>
            <Inner>
              <Inception>
                <MeetingAgendaCards
                  agendaId={agendaItem.id}
                  maxCols={4}
                  meetingId={meetingId}
                  showPlaceholders
                  tasks={agendaTasks}
                  teamId={team.id}
                />
              </Inception>
            </Inner>
          </TaskCardBlock>
          <EditorHelpModalContainer />
        </AgendaItemsWrapper>
        {isFacilitating && (
          <StyledBottomBar>
            <BottomControlSpacer />
            <BottomNavControl
              isBouncing={minTimeComplete}
              onClick={() => gotoNext()}
              innerRef={gotoNextRef}
              onKeyDown={handleRightArrow(() => gotoNext())}
            >
              <BottomNavIconLabel icon='arrow_forward' iconColor='warm' label={label} />
            </BottomNavControl>
            <EndMeetingButton meetingId={meetingId} />
          </StyledBottomBar>
        )}
      </ErrorBoundary>
      <MeetingHelpToggle
        floatAboveBottomBar={isFacilitating}
        menu={<ActionMeetingAgendaItemsHelpMenu />}
      />
    </MeetingContent>
  )
}

graphql`
  fragment ActionMeetingAgendaItemsStage on NewMeetingStage {
    id
    ... on AgendaItemsStage {
      agendaItemId
    }
  }
`

export default createFragmentContainer(
  ActionMeetingAgendaItems,
  graphql`
    fragment ActionMeetingAgendaItems_team on Team {
      id
      isMeetingSidebarCollapsed
      agendaItems {
        id
        content
        teamMember {
          picture
          preferredName
        }
      }
      newMeeting {
        id
        facilitatorUserId
        localStage {
          ...ActionMeetingAgendaItemsStage @relay(mask: false)
        }
        phases {
          id
          phaseType
          stages {
            ...ActionMeetingAgendaItemsStage @relay(mask: false)
          }
        }
      }
      tasks(first: 1000) @connection(key: "TeamColumnsContainer_tasks") {
        edges {
          node {
            ...MeetingAgendaCards_tasks
            id
            agendaId
            createdAt
            sortOrder
          }
        }
      }
    }
  `
)
