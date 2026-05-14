import {datadogRum} from '@datadog/browser-rum'
import {ThumbUp} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {RetroDiscussPhase_meeting$key} from '~/__generated__/RetroDiscussPhase_meeting.graphql'
import useBreakpoint from '~/hooks/useBreakpoint'
import useCallbackRef from '~/hooks/useCallbackRef'
import useRightDrawer from '~/hooks/useRightDrawer'
import EditorHelpModalContainer from '../containers/EditorHelpModalContainer/EditorHelpModalContainer'
import {Breakpoint, DiscussionThreadEnum} from '../types/constEnums'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import plural from '../utils/plural'
import DiscussPhaseReflectionGrid from './DiscussPhaseReflectionGrid'
import LabelHeading from './LabelHeading/LabelHeading'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingTopBar from './MeetingTopBar'
import PhaseHeaderDescription from './PhaseHeaderDescription'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import PhaseWrapper from './PhaseWrapper'
import ReflectionGroup from './ReflectionGroup/ReflectionGroup'
import ResponsiveDashSidebar from './ResponsiveDashSidebar'
import RetroDiscussPhaseDiscussionDrawer from './RetroDiscussPhaseDiscussionDrawer'
import type {RetroMeetingPhaseProps} from './RetroMeeting'
import StageTimerDisplay from './StageTimerDisplay'

interface Props extends RetroMeetingPhaseProps {
  meeting: RetroDiscussPhase_meeting$key
}

const RetroDiscussPhase = (props: Props) => {
  const {avatarGroup, toggleSidebar, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment RetroDiscussPhase_meeting on RetrospectiveMeeting {
        ...DiscussPhaseReflectionGrid_meeting
        ...StageTimerControl_meeting
        ...ReflectionGroup_meeting
        ...StageTimerDisplay_meeting
        ...RetroDiscussPhaseDiscussionDrawer_meeting
        id
        endedAt
        isCommentUnread
        isRightDrawerOpen
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
    `,
    meetingRef
  )
  const [callbackRef, phaseRef] = useCallbackRef()
  const {
    id: meetingId,
    endedAt,
    localStage,
    showSidebar,
    isCommentUnread,
    isRightDrawerOpen
  } = meeting
  const {reflectionGroup} = localStage
  const isDesktop = useBreakpoint(Breakpoint.SINGLE_REFLECTION_COLUMN)
  const toggleDrawer = useRightDrawer(meetingId)
  const title = reflectionGroup?.title ?? ''

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
    const errObj = {id: reflectionGroup.id} as Parameters<typeof JSON.stringify>[0]
    datadogRum.addError(new Error(`NO REFLECTIONS ${JSON.stringify(errObj)}`))
  }

  const headerAndPhaseWidth = isRightDrawerOpen
    ? `w-[calc(100%_-_${DiscussionThreadEnum.WIDTH}px)] poker-discussion-fullscreen-drawer:w-full`
    : 'w-full'

  return (
    <MeetingContent ref={callbackRef}>
      <MeetingHeaderAndPhase className={headerAndPhaseWidth} hideBottomBar={!!endedAt}>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isCommentUnread={isCommentUnread}
          isMeetingSidebarCollapsed={!showSidebar}
          isRightDrawerOpen={isRightDrawerOpen}
          toggleSidebar={toggleSidebar}
          toggleDrawer={toggleDrawer}
        >
          <PhaseHeaderTitle>{phaseLabelLookup.discuss}</PhaseHeaderTitle>
          <PhaseHeaderDescription>
            {'Create takeaway task cards to capture next steps'}
          </PhaseHeaderDescription>
        </MeetingTopBar>
        <PhaseWrapper>
          <StageTimerDisplay meeting={meeting} />
          <div className='flex w-full flex-1 flex-col overflow-hidden'>
            <div className='mx-auto max-w-456 select-none px-5'>
              <div className='mb-3 flex items-center'>
                <div className='relative text-2xl'>{`"${title}"`}</div>
                <div className='ml-4 flex items-center rounded-[5em] bg-slate-600 px-3 py-0.5 font-semibold text-base text-white'>
                  <ThumbUp sx={{fontSize: 18}} className='mr-0.5' />
                  {voteCount || 0}
                </div>
              </div>
            </div>
            <div className='mx-auto flex h-full w-full max-w-456 flex-1 single-reflection-column:flex-row flex-col overflow-hidden'>
              <div className='flex single-reflection-column:h-full w-full single-reflection-column:flex-1 flex-col overflow-hidden'>
                <LabelHeading className='normal-case! sticky top-0 z-2 mx-4 bg-slate-200 single-reflection-column:pb-2'>
                  {reflections.length} {plural(reflections.length, 'Reflection')}
                </LabelHeading>
                <div className='single-reflection-column:block flex h-full w-full justify-center single-reflection-column:p-0 pb-2 single-reflection-column:pb-4'>
                  {isDesktop ? (
                    <DiscussPhaseReflectionGrid meeting={meeting} />
                  ) : (
                    <ReflectionGroup
                      meetingRef={meeting}
                      phaseRef={phaseRef}
                      reflectionGroupRef={reflectionGroup}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </PhaseWrapper>
        <EditorHelpModalContainer />
      </MeetingHeaderAndPhase>
      <ResponsiveDashSidebar
        isOpen={isRightDrawerOpen}
        isRightDrawer
        onToggle={toggleDrawer}
        sidebarWidth={DiscussionThreadEnum.WIDTH}
      >
        <RetroDiscussPhaseDiscussionDrawer
          isDesktop={isDesktop}
          isOpen={isRightDrawerOpen}
          meeting={meeting}
          onToggle={toggleDrawer}
        />
      </ResponsiveDashSidebar>
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

export default RetroDiscussPhase
