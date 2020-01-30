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
import {RetroDiscussPhase_meeting} from '__generated__/RetroDiscussPhase_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'

interface Props extends RetroMeetingPhaseProps {
  meeting: RetroDiscussPhase_meeting
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
  const {avatarGroup, toggleSidebar, handleGotoNext, meeting, isDemoStageComplete} = props
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {gotoNext, ref: gotoNextRef} = handleGotoNext
  const {
    endedAt,
    id: meetingId,
    facilitatorUserId,
    localStage,
    phases,
    showSidebar,
    organization,
    teamId
  } = meeting
  const {id: localStageId, reflectionGroup} = localStage
  const isComplete = localStage ? localStage.isComplete : false
  // reflection group will be null until the server overwrites the placeholder.
  if (!reflectionGroup) return null
  const {id: reflectionGroupId, tasks, title, reflections, voteCount} = reflectionGroup
  const isFacilitating = facilitatorUserId === viewerId && !endedAt
  const nextStageRes = findStageAfterId(phases, localStageId)
  if (!reflections) {
    // this shouldn't ever happen, yet
    // https://sentry.io/organizations/parabol/issues/1322927523/?environment=client&project=107196&query=is%3Aunresolved
    console.error('NO REFLECTIONS', JSON.stringify(reflectionGroup))
  }
  return (
    <MeetingContent>
      <DiscussPhaseSqueeze meeting={meeting} organization={organization} />
      <MeetingHeaderAndPhase>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
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
        <StageTimerControl defaultTimeLimit={5} meeting={meeting} />
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
        <EndMeetingButton meetingId={meetingId} isEnded={!!endedAt} />
        {!nextStageRes && <BottomControlSpacer />}
      </MeetingFacilitatorBar>
    </MeetingContent>
  )
}

graphql`
  fragment RetroDiscussPhase_stage on NewMeetingStage {
    ...StageTimerDisplay_stage
    ... on RetroDiscussStage {
      reflectionGroup {
        id
        title
        voteCount
        reflections {
          ...DiscussPhaseReflectionGrid_reflections
          id
        }
        tasks {
          ...MeetingAgendaCards_tasks
          id
          reflectionGroupId
          content
          createdAt
          sortOrder
        }
      }
    }
    isComplete
    id
  }
`

export default createFragmentContainer(RetroDiscussPhase, {
  meeting: graphql`
    fragment RetroDiscussPhase_meeting on RetrospectiveMeeting {
      ...StageTimerControl_meeting
      endedAt
      organization {
        ...DiscussPhaseSqueeze_organization
      }
      showSidebar
      ...DiscussPhaseSqueeze_meeting
      id
      facilitatorUserId
      phases {
        stages {
          ...RetroDiscussPhase_stage @relay(mask: false)
        }
      }
      localStage {
        ...RetroDiscussPhase_stage @relay(mask: false)
      }
      teamId
    }
  `
})
