import graphql from 'babel-plugin-relay/macro'
import {Suspense, useEffect, useRef} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import {useLocation} from 'react-router'
import type {TeamPromptStructuredMeeting_meeting$key} from '~/__generated__/TeamPromptStructuredMeeting_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import useIsMobile from '~/hooks/useIsMobile'
import useMeeting from '~/hooks/useMeeting'
import {Breakpoint} from '~/types/constEnums'
import {cn} from '../../../ui/cn'
import ErrorBoundary from '../../ErrorBoundary'
import MeetingArea from '../../MeetingArea'
import MeetingContent from '../../MeetingContent'
import MeetingHeaderAndPhase from '../../MeetingHeaderAndPhase'
import MeetingLockedOverlay from '../../MeetingLockedOverlay'
import MeetingStyles from '../../MeetingStyles'
import TeamPromptMobileMeeting from '../mobile/TeamPromptMobileMeeting'
import TeamPromptMobileSheets from '../mobile/TeamPromptMobileSheets'
import TeamPromptDrawer from '../TeamPromptDrawer'
import TeamPromptTopBar from '../TeamPromptTopBar'
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
        ...TeamUpdatesSection_meeting
        ...TeamPromptMobileMeeting_meeting
        ...TeamPromptMobileSheets_meeting
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
  const isMobile = useIsMobile()
  const {id: meetingId, localStageId, endedAt, phases} = meeting
  const responseId = new URLSearchParams(location.search).get('responseId')
  const scrollRef = useRef<HTMLDivElement>(null)
  const composerRef = useRef<HTMLDivElement>(null)
  const composerApiRef = useRef<TeamPromptComposerApi | null>(null)

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
    if (localStageId || endedAt) return
    if (!window.matchMedia(`(min-width: ${Breakpoint.SIDEBAR_LEFT}px)`).matches) return
    commitLocalUpdate(atmosphere, (store) => {
      store.get(meetingId)?.setValue('inspiration', 'rightDrawerOpen')
    })
  }, [])

  if (!safeRoute) return null
  return (
    <MeetingStyles className={cn(isMobile && 'h-dvh')}>
      <MeetingArea>
        <Suspense fallback={''}>
          <TeamPromptComposerApiContext.Provider value={composerApiRef}>
            <MeetingContent>
              <MeetingHeaderAndPhase hideBottomBar={true}>
                <TeamPromptTopBar meetingRef={meeting} />
                {isMobile ? (
                  <ErrorBoundary>
                    <TeamPromptMobileMeeting meetingRef={meeting} />
                  </ErrorBoundary>
                ) : (
                  <>
                    <TeamPromptTemplateHeader meetingRef={meeting} />
                    <ErrorBoundary>
                      <div ref={scrollRef} className='h-full overflow-auto'>
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
                  </>
                )}
              </MeetingHeaderAndPhase>
              {isMobile ? (
                <TeamPromptMobileSheets meetingRef={meeting} />
              ) : (
                <TeamPromptDrawer meetingRef={meeting} />
              )}
            </MeetingContent>
          </TeamPromptComposerApiContext.Provider>
        </Suspense>
      </MeetingArea>
      <MeetingLockedOverlay meetingRef={meeting} />
    </MeetingStyles>
  )
}

export default TeamPromptStructuredMeeting
