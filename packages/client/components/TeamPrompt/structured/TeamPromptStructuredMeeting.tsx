import graphql from 'babel-plugin-relay/macro'
import {Suspense, useEffect, useRef} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import {useLocation} from 'react-router'
import type {TeamPromptStructuredMeeting_meeting$key} from '~/__generated__/TeamPromptStructuredMeeting_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMeeting from '~/hooks/useMeeting'
import ErrorBoundary from '../../ErrorBoundary'
import MeetingArea from '../../MeetingArea'
import MeetingContent from '../../MeetingContent'
import MeetingHeaderAndPhase from '../../MeetingHeaderAndPhase'
import MeetingLockedOverlay from '../../MeetingLockedOverlay'
import MeetingStyles from '../../MeetingStyles'
import TeamPromptDrawer from '../TeamPromptDrawer'
import TeamPromptTopBar from '../TeamPromptTopBar'
import TeamPromptComposer from './TeamPromptComposer'
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
        id
        endedAt
        localStageId
        phases {
          ... on TeamPromptResponsesPhase {
            stages {
              id
              response {
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

  useEffect(() => {
    if (!responseId) return
    const stage = phases[0]?.stages?.find((stage) => stage.response?.id === responseId)
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
    commitLocalUpdate(atmosphere, (store) => {
      store.get(meetingId)?.setValue('inspiration', 'rightDrawerOpen')
    })
  }, [])

  if (!safeRoute) return null
  return (
    <MeetingStyles>
      <MeetingArea>
        <Suspense fallback={''}>
          <MeetingContent>
            <MeetingHeaderAndPhase hideBottomBar={true}>
              <TeamPromptTopBar meetingRef={meeting} />
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
            </MeetingHeaderAndPhase>
            <TeamPromptDrawer meetingRef={meeting} />
          </MeetingContent>
        </Suspense>
      </MeetingArea>
      <MeetingLockedOverlay meetingRef={meeting} />
    </MeetingStyles>
  )
}

export default TeamPromptStructuredMeeting
