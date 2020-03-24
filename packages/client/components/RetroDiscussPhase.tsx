import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import useBreakpoint from 'hooks/useBreakpoint'
import React, {useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import {RetroDiscussPhase_meeting} from '__generated__/RetroDiscussPhase_meeting.graphql'
import EditorHelpModalContainer from '../containers/EditorHelpModalContainer/EditorHelpModalContainer'
import useAtmosphere from '../hooks/useAtmosphere'
import MeetingFacilitatorBar from '../modules/meeting/components/MeetingControlBar/MeetingFacilitatorBar'
import {meetingVoteIcon} from '../styles/meeting'
import {PALETTE} from '../styles/paletteV2'
import {ICON_SIZE} from '../styles/typographyV2'
import {Breakpoint, ElementWidth} from '../types/constEnums'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'
import handleRightArrow from '../utils/handleRightArrow'
import isDemoRoute from '../utils/isDemoRoute'
import lazyPreload from '../utils/lazyPreload'
import findStageAfterId from '../utils/meetings/findStageAfterId'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import plural from '../utils/plural'
import BottomNavControl from './BottomNavControl'
import BottomNavIconLabel from './BottomNavIconLabel'
import DiscussionThreadRoot from './DiscussionThreadRoot'
import DiscussPhaseReflectionGrid from './DiscussPhaseReflectionGrid'
import DiscussPhaseSqueeze from './DiscussPhaseSqueeze'
import EndMeetingButton from './EndMeetingButton'
import Icon from './Icon'
import LabelHeading from './LabelHeading/LabelHeading'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingTopBar from './MeetingTopBar'
import MeetingHelpToggle from './MenuHelpToggle'
import PhaseHeaderDescription from './PhaseHeaderDescription'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import PhaseWrapper from './PhaseWrapper'
import ReflectionGroup from './ReflectionGroup/ReflectionGroup'
import {RetroMeetingPhaseProps} from './RetroMeeting'
import StageTimerDisplay from './RetroReflectPhase/StageTimerDisplay'
import StageTimerControl from './StageTimerControl'
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

const LabelContainer = styled(LabelHeading)<{isDesktop: boolean}>(({isDesktop}) => ({
  background: PALETTE.BACKGROUND_MAIN,
  margin: '0 16px',
  padding: isDesktop ? '0 0 8px' : undefined,
  position: 'sticky',
  textTransform: 'none',
  top: 0,
  zIndex: 2
}))

const DiscussHeader = styled('div')({
  alignItems: 'center',
  display: 'flex',
  margin: '0 0 12px'
})

const ColumnsContainer = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  display: 'flex',
  flexDirection: isDesktop ? undefined : 'column',
  flex: 1,
  height: '100%',
  margin: '0 auto',
  maxWidth,
  overflow: 'hidden',
  padding: 0,
  width: '100%'
}))

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
  fontSize: 16,
  fontWeight: 600,
  margin: '0 0 0 16px',
  padding: '2px 12px'
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
  width: '100%'
})

const ReflectionColumn = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  display: 'flex',
  flexDirection: 'column',
  height: isDesktop ? '100%' : undefined,
  flex: isDesktop ? 1 : undefined,
  overflow: 'auto',
  width: '100%'
}))

const TaskColumn = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  overflow: 'auto',
  padding: '4px 0 0',
  width: '100%'
})

const ColumnInner = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  display: isDesktop ? undefined : 'flex',
  justifyContent: 'center',
  height: '100%',
  padding: isDesktop ? '8px 16px 16px' : undefined,
  paddingBottom: isDesktop ? undefined : 8,
  width: '100%'
}))

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
  const phaseRef = useRef<HTMLDivElement>(null)
  const {viewerId} = atmosphere
  const {gotoNext, ref: gotoNextRef} = handleGotoNext
  const {
    endedAt,
    id: meetingId,
    facilitatorUserId,
    localStage,
    phases,
    showSidebar,
    organization
  } = meeting
  const {id: localStageId, reflectionGroup} = localStage
  const isComplete = localStage ? localStage.isComplete : false
  const isDesktop = useBreakpoint(Breakpoint.SINGLE_REFLECTION_COLUMN)
  // reflection group will be null until the server overwrites the placeholder.
  if (!reflectionGroup) return null
  const {id: reflectionGroupId, title, reflections, voteCount} = reflectionGroup
  const isFacilitating = facilitatorUserId === viewerId && !endedAt
  const nextStageRes = findStageAfterId(phases, localStageId)
  if (!reflections) {
    // this shouldn't ever happen, yet
    // https://sentry.io/organizations/parabol/issues/1322927523/?environment=client&project=107196&query=is%3Aunresolved
    console.error('NO REFLECTIONS', JSON.stringify(reflectionGroup))
  }
  return (
    <MeetingContent ref={phaseRef}>
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
          <StageTimerDisplay meeting={meeting} />
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
            <ColumnsContainer isDesktop={isDesktop}>
              <ReflectionColumn isDesktop={isDesktop}>
                <LabelContainer isDesktop={isDesktop}>
                  {reflections.length} {plural(reflections.length, 'Reflection')}
                </LabelContainer>
                <ColumnInner isDesktop={isDesktop}>
                  {isDesktop ? (
                    <DiscussPhaseReflectionGrid reflections={reflections} />
                  ) : (
                    <ReflectionGroup
                      meeting={meeting}
                      phaseRef={phaseRef}
                      reflectionGroup={reflectionGroup}
                    />
                  )}
                </ColumnInner>
              </ReflectionColumn>
              <TaskColumn>
                <DiscussionThreadRoot meetingId={meetingId} reflectionGroupId={reflectionGroupId} />
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
    ... on RetroDiscussStage {
      reflectionGroup {
        ...ReflectionGroup_reflectionGroup
        id
        title
        voteCount
        reflections {
          ...DiscussPhaseReflectionGrid_reflections
          id
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
      ...ReflectionGroup_meeting
      ...StageTimerDisplay_meeting
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
