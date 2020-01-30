import ms from 'ms'
import React, {useEffect, useMemo} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {ActionMeetingPhaseProps} from './ActionMeeting'
import BottomNavControl from './BottomNavControl'
import BottomNavIconLabel from './BottomNavIconLabel'
import MeetingContent from './MeetingContent'
import MeetingTopBar from './MeetingTopBar'
import MeetingHelpToggle from './MenuHelpToggle'
import useAtmosphere from '../hooks/useAtmosphere'
import MeetingFacilitatorBar from '../modules/meeting/components/MeetingControlBar/MeetingFacilitatorBar'
import MeetingCopy from '../modules/meeting/components/MeetingCopy/MeetingCopy'
import MeetingPhaseHeading from '../modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading'
import handleRightArrow from '../utils/handleRightArrow'
import lazyPreload from '../utils/lazyPreload'
import EndMeetingButton from './EndMeetingButton'
import Avatar from './Avatar/Avatar'
import MeetingAgendaCards from '../modules/meeting/components/MeetingAgendaCards/MeetingAgendaCards'
import EditorHelpModalContainer from '../containers/EditorHelpModalContainer/EditorHelpModalContainer'
import findStageAfterId from '../utils/meetings/findStageAfterId'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import useTimeoutWithReset from '../hooks/useTimeoutWithReset'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import PhaseWrapper from './PhaseWrapper'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import {ActionMeetingAgendaItems_meeting} from '__generated__/ActionMeetingAgendaItems_meeting.graphql'

const BottomControlSpacer = styled('div')({
  minWidth: 90
})

interface Props extends ActionMeetingPhaseProps {
  meeting: ActionMeetingAgendaItems_meeting
}

const ActionMeetingAgendaItemsHelpMenu = lazyPreload(async () =>
  import(
    /* webpackChunkName: 'ActionMeetingAgendaItemsHelpMenu' */ './MeetingHelp/ActionMeetingAgendaItemsHelpMenu'
  )
)

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
  const {avatarGroup, toggleSidebar, meeting, handleGotoNext} = props
  const atmosphere = useAtmosphere()
  const {gotoNext, ref: gotoNextRef} = handleGotoNext
  const [minTimeComplete, resetMinTimeComplete] = useTimeoutWithReset(ms('2m'))
  const {viewerId} = atmosphere
  const {endedAt, showSidebar, team, facilitatorUserId, id: meetingId, localStage, phases} = meeting
  const {id: teamId, agendaItems, tasks} = team
  const {id: localStageId, agendaItemId} = localStage
  useEffect(() => {
    resetMinTimeComplete()
  }, [agendaItemId, resetMinTimeComplete])

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
  const isFacilitating = facilitatorUserId === viewerId && !endedAt
  const nextStageRes = findStageAfterId(phases, localStageId)
  const {phase: nextPhase} = nextStageRes!
  const label =
    nextPhase.phaseType === NewMeetingPhaseTypeEnum.lastcall ? 'Last Call' : 'Next Topic'
  return (
    <MeetingContent>
      <MeetingHeaderAndPhase>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          toggleSidebar={toggleSidebar}
        >
          <PhaseHeaderTitle>
            {phaseLabelLookup[NewMeetingPhaseTypeEnum.agendaitems]}
          </PhaseHeaderTitle>
        </MeetingTopBar>
        <PhaseWrapper>
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
                  teamId={teamId}
                />
              </Inception>
            </Inner>
          </TaskCardBlock>
          <EditorHelpModalContainer />
        </PhaseWrapper>
        <MeetingHelpToggle menu={<ActionMeetingAgendaItemsHelpMenu />} />
      </MeetingHeaderAndPhase>
      <MeetingFacilitatorBar isFacilitating={isFacilitating}>
        <BottomControlSpacer />
        <BottomNavControl
          isBouncing={minTimeComplete}
          onClick={() => gotoNext()}
          ref={gotoNextRef}
          onKeyDown={handleRightArrow(() => gotoNext())}
        >
          <BottomNavIconLabel icon='arrow_forward' iconColor='warm' label={label} />
        </BottomNavControl>
        <EndMeetingButton meetingId={meetingId} isEnded={!!endedAt} />
      </MeetingFacilitatorBar>
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

export default createFragmentContainer(ActionMeetingAgendaItems, {
  meeting: graphql`
    fragment ActionMeetingAgendaItems_meeting on ActionMeeting {
      id
      showSidebar
      endedAt
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
      team {
        id
        agendaItems {
          id
          content
          teamMember {
            picture
            preferredName
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
    }
  `
})
