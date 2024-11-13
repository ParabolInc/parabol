import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {Suspense, useEffect, useMemo} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import {useHistory} from 'react-router'
import {TeamPromptMeeting_meeting$key} from '~/__generated__/TeamPromptMeeting_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMeeting from '~/hooks/useMeeting'
import useTransition from '~/hooks/useTransition'
import {DiscussionThreadEnum} from '~/types/constEnums'
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
import {
  GRID_PADDING_LEFT_RIGHT_PERCENT,
  ResponsesGridBreakpoints
} from './TeamPrompt/TeamPromptGridDimensions'
import TeamPromptResponseCard from './TeamPrompt/TeamPromptResponseCard'
import TeamPromptTopBar from './TeamPrompt/TeamPromptTopBar'

const twoColumnResponseMediaQuery = `@media screen and (min-width: ${ResponsesGridBreakpoints.TWO_RESPONSE_COLUMN}px)`

const ResponsesGridContainer = styled('div')({
  height: '100%',
  overflow: 'auto',
  padding: 16,
  [twoColumnResponseMediaQuery]: {
    padding: `32px ${GRID_PADDING_LEFT_RIGHT_PERCENT * 100}%`
  }
})
const ResponsesGrid = styled('div')({
  flex: 1,
  display: 'flex',
  flexWrap: 'wrap',
  flexDirection: 'column',
  position: 'relative',
  gap: 32
})

interface Props {
  meeting: TeamPromptMeeting_meeting$key
}

const StyledMeetingHeaderAndPhase = styled(MeetingHeaderAndPhase)<{isOpen: boolean}>(
  ({isOpen}) => ({
    width: isOpen ? `calc(100% - ${DiscussionThreadEnum.WIDTH}px)` : '100%'
  })
)

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
        isRightDrawerOpen
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

    return orderedStages.map((stage, displayIdx) => {
      return {
        ...stage,
        key: stage.id,
        displayIdx
      }
    })
  }, [phase])
  const transitioningStages = useTransition(stages)
  const {safeRoute, isDesktop} = useMeeting(meeting)
  const history = useHistory()
  const {isRightDrawerOpen, id: meetingId, localStageId} = meeting
  const params = new URLSearchParams(history.location.search)
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
      meetingProxy.setValue(false, 'showWorkSidebar')
      meetingProxy.setValue(true, 'isRightDrawerOpen')
    })
  }, [responseId])

  useEffect(() => {
    if (localStageId || !!meeting?.endedAt) {
      return
    }
    commitLocalUpdate(atmosphere, (store) => {
      const meetingProxy = store.get(meetingId)
      if (!meetingProxy) return
      meetingProxy.setValue(true, 'showWorkSidebar')
      meetingProxy.setValue(true, 'isRightDrawerOpen')
    })
  }, [])

  if (!safeRoute) return null

  return (
    <MeetingStyles>
      <MeetingArea>
        <Suspense fallback={''}>
          <MeetingContent>
            <StyledMeetingHeaderAndPhase
              isOpen={isRightDrawerOpen && isDesktop}
              hideBottomBar={true}
            >
              <TeamPromptTopBar meetingRef={meeting} />
              <TeamPromptEditablePrompt meetingRef={meeting} />
              <ErrorBoundary>
                <ResponsesGridContainer>
                  <ResponsesGrid>
                    {transitioningStages.map((transitioningStage) => {
                      const {child: stage, onTransitionEnd, status} = transitioningStage
                      const {key, displayIdx} = stage

                      return (
                        <TeamPromptResponseCard
                          key={key}
                          status={status}
                          onTransitionEnd={onTransitionEnd}
                          displayIdx={displayIdx}
                          stageRef={stage}
                        />
                      )
                    })}
                  </ResponsesGrid>
                </ResponsesGridContainer>
              </ErrorBoundary>
            </StyledMeetingHeaderAndPhase>
            <TeamPromptDrawer meetingRef={meeting} isDesktop={isDesktop} />
          </MeetingContent>
        </Suspense>
      </MeetingArea>
      <MeetingLockedOverlay meetingRef={meeting} />
    </MeetingStyles>
  )
}

export default TeamPromptMeeting
