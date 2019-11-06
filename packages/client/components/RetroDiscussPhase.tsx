import {RetroDiscussPhase_team} from '../__generated__/RetroDiscussPhase_team.graphql'
import React from 'react'
import styled from '@emotion/styled'
import BottomNavControl from './BottomNavControl'
import BottomNavIconLabel from './BottomNavIconLabel'
import DiscussPhaseReflectionGrid from './DiscussPhaseReflectionGrid'
import Icon from './Icon'
import LabelHeading from './LabelHeading/LabelHeading'
import MeetingContent from './MeetingContent'
import MeetingTopBar from './MeetingTopBar'
import MeetingHelpToggle from './MenuHelpToggle'
import PhaseHeaderDescription from './PhaseHeaderDescription'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import Overflow from './Overflow'
import {RetroMeetingPhaseProps} from './RetroMeeting'
import EditorHelpModalContainer from '../containers/EditorHelpModalContainer/EditorHelpModalContainer'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import MeetingAgendaCards from '../modules/meeting/components/MeetingAgendaCards/MeetingAgendaCards'
import MeetingFacilitatorBar from '../modules/meeting/components/MeetingControlBar/MeetingFacilitatorBar'
import {ICON_SIZE} from '../styles/typographyV2'
import {meetingVoteIcon} from '../styles/meeting'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'
import lazyPreload from '../utils/lazyPreload'
import findStageAfterId from '../utils/meetings/findStageAfterId'
import plural from '../utils/plural'
import handleRightArrow from '../utils/handleRightArrow'
import isDemoRoute from '../utils/isDemoRoute'
import EndMeetingButton from './EndMeetingButton'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import StageTimerDisplay from './RetroReflectPhase/StageTimerDisplay'
import StageTimerControl from './StageTimerControl'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import PhaseWrapper from './PhaseWrapper'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {ElementWidth} from '../types/constEnums'
import {PALETTE} from '../styles/paletteV2'
import DiscussPhaseSqueeze from './DiscussPhaseSqueeze'

interface Props extends WithAtmosphereProps, RetroMeetingPhaseProps {
  team: RetroDiscussPhase_team
}

const maxWidth = '114rem'

const HeaderContainer = styled('div')({
  margin: '0 auto',
  maxWidth,
  padding: '0 1.25rem',
  userSelect: 'none'
})

const LabelContainer = styled('div')({
  background: PALETTE.BACKGROUND_MAIN,
  margin: '0 1.25rem',
  padding: '0 0 .625rem',
  position: 'sticky',
  top: 0,
  zIndex: 2
})

const DiscussHeader = styled('div')({
  alignItems: 'center',
  display: 'flex',
  margin: '0 0 1.25rem'
})

const ColumnsContainer = styled('div')({
  display: 'flex',
  flex: 1,
  height: '100%',
  margin: '0 auto',
  maxWidth,
  overflowX: 'auto',
  padding: 0,
  width: '100%'
})

const TopicHeading = styled('div')({
  fontSize: 24,
  position: 'relative',
  '& > span': {
    right: '100%',
    position: 'absolute'
  }
})

const VoteMeta = styled('div')({
  alignItems: 'center',
  backgroundColor: PALETTE.BACKGROUND_GRAY,
  borderRadius: '5em',
  color: '#FFFFFF',
  display: 'flex',
  fontSize: ICON_SIZE.MD18,
  fontWeight: 600,
  margin: '.125rem 0 0 1rem',
  padding: '.125rem .75rem'
})

const VoteIcon = styled(Icon)({
  color: '#FFFFFF',
  fontSize: ICON_SIZE.MD18,
  marginRight: '.125rem'
})

const DiscussPhaseWrapper = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  overflow: 'hidden',
  paddingTop: 16,
  width: '100%'
})

const Column = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  width: '100%'
})

const TaskColumn = styled(Column)({
  borderLeft: '1px solid rgba(0, 0, 0, .05)'
})

const ColumnInner = styled('div')({
  height: '100%',
  padding: '.625rem 1.25rem 1.25rem',
  width: '100%'
})

const BottomControlSpacer = styled('div')({
  minWidth: 90
})

const CenterControlBlock = styled('div')<{isComplete: boolean}>(({isComplete}) => ({
  margin: '0 auto',
  paddingLeft: isComplete ? ElementWidth.END_MEETING_BUTTON : undefined
}))

const DiscussHelpMenu = lazyPreload(async () =>
  import(/* webpackChunkName: 'DiscussHelpMenu' */ './MeetingHelp/DiscussHelpMenu')
)
const DemoDiscussHelpMenu = lazyPreload(async () =>
  import(/* webpackChunkName: 'DemoDiscussHelpMenu' */ './MeetingHelp/DemoDiscussHelpMenu')
)

const RetroDiscussPhase = (props: Props) => {
  const {avatarGroup, toggleSidebar, atmosphere, handleGotoNext, team, isDemoStageComplete} = props
  const {viewerId} = atmosphere
  const {isMeetingSidebarCollapsed, newMeeting, id: teamId, organization} = team
  if (!newMeeting) return null
  const {gotoNext, ref: gotoNextRef} = handleGotoNext
  const {id: meetingId, facilitatorUserId, localStage, phases} = newMeeting
  const {id: localStageId, reflectionGroup} = localStage
  const isComplete = localStage ? localStage.isComplete : false
  // reflection group will be null until the server overwrites the placeholder.
  if (!reflectionGroup) return null
  const {id: reflectionGroupId, tasks, title, reflections, voteCount} = reflectionGroup
  const isFacilitating = facilitatorUserId === viewerId
  const nextStageRes = findStageAfterId(phases, localStageId)
  return (
    <MeetingContent>
      <DiscussPhaseSqueeze meeting={newMeeting} organization={organization} />
      <MeetingHeaderAndPhase>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!!isMeetingSidebarCollapsed}
          toggleSidebar={toggleSidebar}
        >
          <PhaseHeaderTitle>{phaseLabelLookup[NewMeetingPhaseTypeEnum.discuss]}</PhaseHeaderTitle>
          <PhaseHeaderDescription>
            {'Create takeaway task cards to capture next steps'}
          </PhaseHeaderDescription>
        </MeetingTopBar>
        <PhaseWrapper>
          <StageTimerDisplay stage={localStage} />
          <DiscussPhaseWrapper>
            <HeaderContainer>
              <DiscussHeader>
                <TopicHeading>{`“${title}”`}</TopicHeading>
                <VoteMeta>
                  <VoteIcon>{meetingVoteIcon}</VoteIcon>
                  {voteCount || 0}
                </VoteMeta>
              </DiscussHeader>
            </HeaderContainer>
            <ColumnsContainer>
              <Column>
                <LabelContainer>
                  <LabelHeading>
                    {reflections.length} {plural(reflections.length, 'Reflection')}
                  </LabelHeading>
                </LabelContainer>
                <Overflow>
                  <ColumnInner>
                    <DiscussPhaseReflectionGrid reflections={reflections} />
                  </ColumnInner>
                </Overflow>
              </Column>
              <TaskColumn>
                <LabelContainer>
                  <LabelHeading>Takeaway Tasks</LabelHeading>
                </LabelContainer>
                <ColumnInner>
                  <MeetingAgendaCards
                    meetingId={meetingId}
                    reflectionGroupId={reflectionGroupId}
                    tasks={tasks}
                    teamId={teamId}
                  />
                </ColumnInner>
              </TaskColumn>
            </ColumnsContainer>
          </DiscussPhaseWrapper>
        </PhaseWrapper>
        <MeetingHelpToggle menu={isDemoRoute() ? <DemoDiscussHelpMenu /> : <DiscussHelpMenu />} />
        <EditorHelpModalContainer />
      </MeetingHeaderAndPhase>
      <MeetingFacilitatorBar isFacilitating={isFacilitating}>
        <StageTimerControl defaultTimeLimit={5} meetingId={meetingId} team={team} />
        {!nextStageRes && isComplete && <BottomControlSpacer />}
        {nextStageRes && (
          <CenterControlBlock isComplete={isComplete}>
            <BottomNavControl
              isBouncing={isDemoStageComplete}
              onClick={() => gotoNext()}
              ref={gotoNextRef}
              onKeyDown={handleRightArrow(() => gotoNext())}
            >
              <BottomNavIconLabel icon='arrow_forward' iconColor='warm' label={'Next Topic'} />
            </BottomNavControl>
          </CenterControlBlock>
        )}
        <EndMeetingButton meetingId={meetingId} />
        {!nextStageRes && <BottomControlSpacer />}
      </MeetingFacilitatorBar>
    </MeetingContent>
  )
}

export default createFragmentContainer(withAtmosphere(RetroDiscussPhase), {
  team: graphql`
    fragment RetroDiscussPhase_team on Team {
      ...StageTimerControl_team
      organization {
        ...DiscussPhaseSqueeze_organization
      }
      isMeetingSidebarCollapsed
      id
      newMeeting {
        ...DiscussPhaseSqueeze_meeting
        id
        facilitatorUserId
        phases {
          stages {
            ...StageTimerDisplay_stage
            id
            ... on RetroDiscussStage {
              reflectionGroup {
                id
                tasks {
                  ...MeetingAgendaCards_tasks
                }
              }
            }
          }
        }
        localPhase {
          stages {
            id
          }
        }
        localStage {
          ...StageTimerDisplay_stage
          isComplete
          id
          ... on RetroDiscussStage {
            reflectionGroup {
              id
              title
              voteCount
              reflections {
                id
                ...DiscussPhaseReflectionGrid_reflections
              }
              tasks {
                id
                reflectionGroupId
                content
                createdAt
                sortOrder
                ...MeetingAgendaCards_tasks
              }
            }
          }
        }
      }
    }
  `
})
