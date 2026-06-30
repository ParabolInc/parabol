import graphql from 'babel-plugin-relay/macro'
import {AnimatePresence} from 'motion/react'
import {Suspense, useEffect, useMemo} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import {useLocation} from 'react-router'
import type {TeamPromptMeeting_meeting$key} from '~/__generated__/TeamPromptMeeting_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMeeting from '~/hooks/useMeeting'
import {isNotNull} from '~/utils/predicates'
import sortByISO8601Date from '~/utils/sortByISO8601Date'
import getPhaseByTypename from '../utils/getPhaseByTypename'
import ErrorBoundary from './ErrorBoundary'
import MeetingArea from './MeetingArea'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingLockedOverlay from './MeetingLockedOverlay'
import MeetingStyles from './MeetingStyles'
import TeamPromptDrawer from './TeamPrompt/TeamPromptDrawer'
import TeamPromptEditablePrompt from './TeamPrompt/TeamPromptEditablePrompt'
import TeamPromptResponseCard from './TeamPrompt/TeamPromptResponseCard'
import TeamPromptTopBar from './TeamPrompt/TeamPromptTopBar'

interface Props {
  meeting: TeamPromptMeeting_meeting$key
}

const TeamPromptMeeting = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment TeamPromptMeeting_meeting on TeamPromptMeeting {
        ...useMeeting_meeting
        ...TeamPromptTopBar_meeting
        ...TeamPromptDrawer_meeting
        ...TeamPromptEditablePrompt_meeting
        ...TeamPromptMeetingStatus_meeting
        ...MeetingLockedOverlay_meeting
        id
        endedAt
        localStageId
        phases {
          ... on TeamPromptResponsesPhase {
            __typename
            stages {
              id
              teamMember {
                userId
              }
              response {
                id
                plaintextContent
                createdAt
              }
              ...TeamPromptResponseCard_stage
            }
          }
        }
      }
    `,
    meetingRef
  )
  const {phases} = meeting
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere

  const phase = getPhaseByTypename(phases, 'TeamPromptResponsesPhase')
  const stages = useMemo(() => {
    const allStages = phase.stages.filter(isNotNull)

    const nonViewerStages = allStages.filter((stage) => stage.teamMember.userId !== viewerId)
    const orderedNonEmptyStages = nonViewerStages
      .filter((stage) => !!stage.response?.plaintextContent)
      .sort((stageA, stageB) =>
        sortByISO8601Date(stageA.response!.createdAt, stageB.response!.createdAt)
      )
    // Empty stages are implicitly ordered by stage creation time on the backend.
    const orderedEmptyStages = nonViewerStages.filter((stage) => !stage.response?.plaintextContent)
    let orderedStages = [...orderedNonEmptyStages, ...orderedEmptyStages]

    // Add the viewer's card to the front.
    const viewerCard = allStages.find((stage) => stage.teamMember.userId === viewerId)
    if (viewerCard) {
      orderedStages = [viewerCard, ...orderedStages]
    }

    return orderedStages.map((stage) => ({...stage, key: stage.id}))
  }, [phase])
  const {safeRoute} = useMeeting(meeting)
  const location = useLocation()
  const {id: meetingId, localStageId} = meeting
  const params = new URLSearchParams(location.search)
  const responseId = params.get('responseId')
  useEffect(() => {
    if (!responseId) {
      return
    }

    const stage = stages.find((stage) => stage.response?.id === params.get('responseId'))
    if (!stage) {
      return
    }

    commitLocalUpdate(atmosphere, (store) => {
      const meetingProxy = store.get(meetingId)
      if (!meetingProxy) return
      meetingProxy.setValue(stage.id, 'localStageId')
      meetingProxy.setValue('discussion', 'rightDrawerOpen')
    })
  }, [responseId])

  useEffect(() => {
    if (localStageId || !!meeting?.endedAt) {
      return
    }
    commitLocalUpdate(atmosphere, (store) => {
      const meetingProxy = store.get(meetingId)
      if (!meetingProxy) return
      meetingProxy.setValue('inspiration', 'rightDrawerOpen')
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
              <TeamPromptEditablePrompt meetingRef={meeting} />
              <ErrorBoundary>
                {/* twoColumnBreakpoint=880px, padding=10% of screen */}
                <div className='h-full overflow-auto p-4 min-[880px]:px-[10%] min-[880px]:py-8'>
                  <div className='relative flex flex-1 flex-col flex-wrap gap-8'>
                    <AnimatePresence initial={false}>
                      {stages.map((stage) => (
                        <TeamPromptResponseCard key={stage.key} stageRef={stage} />
                      ))}
                    </AnimatePresence>
                  </div>
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

export default TeamPromptMeeting
