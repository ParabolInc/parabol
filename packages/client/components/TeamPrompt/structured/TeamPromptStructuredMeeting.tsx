import graphql from 'babel-plugin-relay/macro'
import {Suspense, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import {useLocation} from 'react-router'
import type {TeamPromptStructuredMeeting_meeting$key} from '~/__generated__/TeamPromptStructuredMeeting_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMeeting from '~/hooks/useMeeting'
import usePhoneViewport, {isPhoneViewport} from '~/hooks/usePhoneViewport'
import {cn} from '../../../ui/cn'
import ErrorBoundary from '../../ErrorBoundary'
import MeetingArea from '../../MeetingArea'
import MeetingContent from '../../MeetingContent'
import MeetingHeaderAndPhase from '../../MeetingHeaderAndPhase'
import MeetingLockedOverlay from '../../MeetingLockedOverlay'
import MeetingStyles from '../../MeetingStyles'
import TeamPromptDrawer from '../TeamPromptDrawer'
import TeamPromptTopBar from '../TeamPromptTopBar'
import TeamPromptPhoneAppBar from './mobile/TeamPromptPhoneAppBar'
import TeamPromptPhoneFocusedBar from './mobile/TeamPromptPhoneFocusedBar'
import {type PhoneComposerControls, PhoneComposerStateContext} from './mobile/usePhoneComposerState'
import TeamPromptComposer from './TeamPromptComposer'
import TeamPromptComposerApiContext, {
  type TeamPromptComposerApi
} from './TeamPromptComposerApiContext'
import TeamPromptTemplateHeader from './TeamPromptTemplateHeader'
import TeamUpdatesSection from './TeamUpdatesSection'

interface Props {
  meetingRef: TeamPromptStructuredMeeting_meeting$key
}

const TeamPromptStructuredMeeting = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment TeamPromptStructuredMeeting_meeting on TeamPromptMeeting {
        ...useMeeting_meeting
        ...TeamPromptTopBar_meeting
        ...TeamPromptDrawer_meeting
        ...MeetingLockedOverlay_meeting
        ...TeamPromptTemplateHeader_meeting
        ...TeamPromptComposer_meeting
        ...TeamPromptPhoneAppBar_meeting
        ...TeamUpdatesSection_meeting
        id
        endedAt
        localStageId
        phases {
          ... on TeamPromptResponsesPhase {
            stages {
              id
              responses {
                id
              }
            }
          }
        }
      }
    `,
    meetingRef
  )
  const atmosphere = useAtmosphere()
  const {safeRoute} = useMeeting(meeting)
  const location = useLocation()
  const {id: meetingId, localStageId, endedAt, phases} = meeting
  const responseId = new URLSearchParams(location.search).get('responseId')
  const scrollRef = useRef<HTMLDivElement>(null)
  const composerRef = useRef<HTMLDivElement>(null)
  const composerApiRef = useRef<TeamPromptComposerApi | null>(null)
  const composerControlsRef = useRef<PhoneComposerControls | null>(null)
  const isPhone = usePhoneViewport()
  const [focusedPromptId, setFocusedPromptId] = useState<string | null>(null)
  const [progress, setProgress] = useState({answeredCount: 0, promptCount: 0})
  const publishProgress = useCallback((answeredCount: number, promptCount: number) => {
    setProgress((prev) =>
      prev.answeredCount === answeredCount && prev.promptCount === promptCount
        ? prev
        : {answeredCount, promptCount}
    )
  }, [])
  const requestBlur = useCallback(() => {
    composerControlsRef.current?.blur()
    setFocusedPromptId(null)
  }, [])
  const focusNextUnanswered = useCallback(
    () => composerControlsRef.current?.focusNextUnanswered() ?? false,
    []
  )
  const phoneComposerState = useMemo(
    () => ({
      focusedPromptId,
      setFocusedPromptId,
      answeredCount: progress.answeredCount,
      promptCount: progress.promptCount,
      publishProgress,
      requestBlur,
      focusNextUnanswered,
      controlsRef: composerControlsRef
    }),
    [focusedPromptId, progress, publishProgress, requestBlur, focusNextUnanswered]
  )

  useEffect(() => {
    if (!responseId) return
    const stage = phases[0]?.stages?.find((stage) =>
      stage.responses.some((response) => response.id === responseId)
    )
    if (!stage) return
    commitLocalUpdate(atmosphere, (store) => {
      const meetingProxy = store.get(meetingId)
      if (!meetingProxy) return
      meetingProxy.setValue(stage.id, 'localStageId')
      meetingProxy.setValue('discussion', 'rightDrawerOpen')
    })
  }, [responseId])

  useEffect(() => {
    const onPhone = isPhoneViewport()
    if (onPhone && responseId) return
    if (!onPhone && (localStageId || endedAt)) return
    commitLocalUpdate(atmosphere, (store) => {
      store.get(meetingId)?.setValue(onPhone ? null : 'inspiration', 'rightDrawerOpen')
    })
  }, [])

  if (!safeRoute) return null
  return (
    <MeetingStyles>
      <MeetingArea>
        <Suspense fallback={''}>
          <TeamPromptComposerApiContext.Provider value={composerApiRef}>
            <PhoneComposerStateContext.Provider value={isPhone ? phoneComposerState : null}>
              <MeetingContent>
                <MeetingHeaderAndPhase hideBottomBar={true}>
                  {isPhone ? (
                    focusedPromptId ? (
                      <TeamPromptPhoneFocusedBar
                        answeredCount={progress.answeredCount}
                        promptCount={progress.promptCount}
                        onDone={requestBlur}
                      />
                    ) : (
                      <TeamPromptPhoneAppBar meetingRef={meeting} />
                    )
                  ) : (
                    <>
                      <TeamPromptTopBar meetingRef={meeting} />
                      <TeamPromptTemplateHeader meetingRef={meeting} />
                    </>
                  )}
                  <ErrorBoundary>
                    <div
                      ref={scrollRef}
                      className={cn(
                        'h-full overflow-auto',
                        isPhone && 'pb-[var(--tp-bottom-bar,0px)]'
                      )}
                    >
                      <div ref={composerRef}>
                        <TeamPromptComposer meetingRef={meeting} />
                      </div>
                      <TeamUpdatesSection
                        meetingRef={meeting}
                        scrollContainerRef={scrollRef}
                        composerRef={composerRef}
                      />
                    </div>
                  </ErrorBoundary>
                </MeetingHeaderAndPhase>
                <TeamPromptDrawer meetingRef={meeting} />
              </MeetingContent>
            </PhoneComposerStateContext.Provider>
          </TeamPromptComposerApiContext.Provider>
        </Suspense>
      </MeetingArea>
      <MeetingLockedOverlay meetingRef={meeting} />
    </MeetingStyles>
  )
}

export default TeamPromptStructuredMeeting
