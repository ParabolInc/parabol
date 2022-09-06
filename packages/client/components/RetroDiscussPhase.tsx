import styled from '@emotion/styled'
import {ThumbUp} from '@mui/icons-material'
import * as Sentry from '@sentry/browser'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import useBreakpoint from '~/hooks/useBreakpoint'
import useCallbackRef from '~/hooks/useCallbackRef'
import {RetroDiscussPhase_meeting} from '~/__generated__/RetroDiscussPhase_meeting.graphql'
import EditorHelpModalContainer from '../containers/EditorHelpModalContainer/EditorHelpModalContainer'
import {PALETTE} from '../styles/paletteV3'
import {Breakpoint} from '../types/constEnums'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import plural from '../utils/plural'
import {DiscussionThreadables, Header as DiscussionThreadHeader} from './DiscussionThreadList'
import DiscussionThreadListEmptyState from './DiscussionThreadListEmptyState'
import DiscussionThreadRoot from './DiscussionThreadRoot'
import DiscussPhaseReflectionGrid from './DiscussPhaseReflectionGrid'
import DiscussPhaseSqueeze from './DiscussPhaseSqueeze'
import LabelHeading from './LabelHeading/LabelHeading'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingTopBar from './MeetingTopBar'
import PhaseHeaderDescription from './PhaseHeaderDescription'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import PhaseWrapper from './PhaseWrapper'
import ReflectionGroup from './ReflectionGroup/ReflectionGroup'
import {RetroMeetingPhaseProps} from './RetroMeeting'
import StageTimerDisplay from './StageTimerDisplay'
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
  background: PALETTE.SLATE_200,
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
  backgroundColor: PALETTE.SLATE_600,
  borderRadius: '5em',
  color: '#FFFFFF',
  display: 'flex',
  fontSize: 16,
  fontWeight: 600,
  margin: '0 0 0 16px',
  padding: '2px 12px'
})

const VoteIcon = styled(ThumbUp)({
  color: '#FFFFFF',
  height: 18,
  width: 18,
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
  overflow: 'hidden',
  width: '100%'
}))

const ThreadColumn = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  overflow: 'auto',
  paddingTop: 4,
  paddingBottom: isDesktop ? 16 : 8,
  width: '100%'
}))

const ColumnInner = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  display: isDesktop ? undefined : 'flex',
  justifyContent: 'center',
  height: '100%',
  padding: isDesktop ? '0 0 16px' : undefined,
  paddingBottom: isDesktop ? undefined : 8,
  width: '100%'
}))

const RetroDiscussPhase = (props: Props) => {
  const {avatarGroup, toggleSidebar, meeting} = props

  const {t} = useTranslation()

  const [callbackRef, phaseRef] = useCallbackRef()
  const {endedAt, localStage, showSidebar, organization} = meeting
  const {reflectionGroup, discussionId} = localStage
  const isDesktop = useBreakpoint(Breakpoint.SINGLE_REFLECTION_COLUMN)
  const title = reflectionGroup?.title ?? ''
  const allowedThreadables: DiscussionThreadables[] = endedAt ? [] : ['comment', 'task', 'poll']

  // Uncomment below code to enable Easter Egg:
  // bugs shown on screen when the discussion group title contains "bug"
  //
  // const {isComplete} = localStage
  // const isBuggy = (!isComplete && title?.toLowerCase().includes('bug')) ?? false
  // useScreenBugs(isBuggy, meetingId)

  // reflection group will be null until the server overwrites the placeholder.
  if (!reflectionGroup) return null
  const {voteCount} = reflectionGroup

  const reflections = reflectionGroup.reflections ?? []
  if (!reflectionGroup.reflections) {
    // this shouldn't ever happen, yet
    // https://sentry.io/organizations/parabol/issues/1322927523/?environment=client&project=107196&query=is%3Aunresolved
    const errObj = {id: reflectionGroup.id} as any
    if (reflectionGroup.hasOwnProperty('reflections')) {
      errObj.reflections = reflections
    }
    Sentry.captureException(new Error(`NO REFLECTIONS ${JSON.stringify(errObj)}`))
  }
  return (
    <MeetingContent ref={callbackRef}>
      <DiscussPhaseSqueeze meeting={meeting} organization={organization} />
      <MeetingHeaderAndPhase hideBottomBar={!!endedAt}>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          toggleSidebar={toggleSidebar}
        >
          <PhaseHeaderTitle>{phaseLabelLookup.discuss}</PhaseHeaderTitle>
          <PhaseHeaderDescription>
            {t('RetroDiscussPhase.CreateTakeawayTaskCardsToCaptureNextSteps')}
          </PhaseHeaderDescription>
        </MeetingTopBar>
        <PhaseWrapper>
          <StageTimerDisplay meeting={meeting} />
          <DiscussPhaseWrapper>
            <HeaderContainer>
              <DiscussHeader>
                <TopicHeading>{`“${title}”`}</TopicHeading>
                <VoteMeta>
                  <VoteIcon />
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
                    <DiscussPhaseReflectionGrid meeting={meeting} />
                  ) : (
                    <ReflectionGroup
                      meetingRef={meeting}
                      phaseRef={phaseRef}
                      reflectionGroupRef={reflectionGroup}
                    />
                  )}
                </ColumnInner>
              </ReflectionColumn>
              <ThreadColumn isDesktop={isDesktop}>
                <DiscussionThreadRoot
                  allowedThreadables={allowedThreadables}
                  meetingContentRef={phaseRef}
                  discussionId={discussionId!}
                  header={
                    <DiscussionThreadHeader>
                      {t('RetroDiscussPhase.DiscussionTakeawayTasks')}
                    </DiscussionThreadHeader>
                  }
                  emptyState={
                    <DiscussionThreadListEmptyState
                      allowTasks={true}
                      isReadOnly={allowedThreadables.length === 0}
                    />
                  }
                />
              </ThreadColumn>
            </ColumnsContainer>
          </DiscussPhaseWrapper>
        </PhaseWrapper>
        <EditorHelpModalContainer />
      </MeetingHeaderAndPhase>
    </MeetingContent>
  )
}

graphql`
  fragment RetroDiscussPhase_stage on NewMeetingStage {
    ... on RetroDiscussStage {
      isComplete
      discussionId
      reflectionGroup {
        ...ReflectionGroup_reflectionGroup
        id
        title
        voteCount
        reflections {
          id
        }
      }
    }
  }
`

export default createFragmentContainer(RetroDiscussPhase, {
  meeting: graphql`
    fragment RetroDiscussPhase_meeting on RetrospectiveMeeting {
      ...DiscussPhaseReflectionGrid_meeting
      ...DiscussPhaseSqueeze_meeting
      ...StageTimerControl_meeting
      ...ReflectionGroup_meeting
      ...StageTimerDisplay_meeting
      endedAt
      organization {
        ...DiscussPhaseSqueeze_organization
      }
      showSidebar
      phases {
        stages {
          ...RetroDiscussPhase_stage @relay(mask: false)
        }
      }
      localStage {
        ...RetroDiscussPhase_stage @relay(mask: false)
      }
    }
  `
})
