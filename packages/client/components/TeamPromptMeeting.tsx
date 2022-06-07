import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {Suspense, useMemo} from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useEventCallback from '~/hooks/useEventCallback'
import useMeeting from '~/hooks/useMeeting'
import useMutationProps from '~/hooks/useMutationProps'
import useTransition from '~/hooks/useTransition'
import UpdateMeetingPromptMutation from '~/mutations/UpdateMeetingPromptMutation'
import {DiscussionThreadEnum} from '~/types/constEnums'
import {isNotNull} from '~/utils/predicates'
import sortByISO8601Date from '~/utils/sortByISO8601Date'
import Legitity from '~/validation/Legitity'
import {TeamPromptMeeting_meeting$key} from '~/__generated__/TeamPromptMeeting_meeting.graphql'
import getPhaseByTypename from '../utils/getPhaseByTypename'
import EditableText from './EditableText'
import ErrorBoundary from './ErrorBoundary'
import MeetingArea from './MeetingArea'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingStyles from './MeetingStyles'
import TeamPromptDiscussionDrawer from './TeamPrompt/TeamPromptDiscussionDrawer'
import {ResponsesGridBreakpoints} from './TeamPrompt/TeamPromptGridDimensions'
import TeamPromptResponseCard from './TeamPrompt/TeamPromptResponseCard'
import TeamPromptTopBar from './TeamPrompt/TeamPromptTopBar'

const Prompt = styled('h1')({
  textAlign: 'center',
  margin: 16,
  fontSize: 20,
  lineHeight: '32px',
  fontWeight: 400
})

const twoColumnResponseMediaQuery = `@media screen and (min-width: ${ResponsesGridBreakpoints.TWO_RESPONSE_COLUMN}px)`

const EditablePrompt = Prompt.withComponent(EditableText)

const ResponsesGridContainer = styled('div')({
  height: '100%',
  overflow: 'auto',
  padding: 16,
  [twoColumnResponseMediaQuery]: {
    padding: `32px 7%`
  }
})

const ResponsesGrid = styled('div')({
  flex: 1,
  display: 'flex',
  flexWrap: 'wrap',
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
        ...TeamPromptDiscussionDrawer_meeting
        id
        facilitatorUserId
        isRightDrawerOpen
        meetingPrompt
        phases {
          ... on TeamPromptResponsesPhase {
            __typename
            stages {
              id
              teamMember {
                userId
              }
              response {
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
  const {id: meetingId, facilitatorUserId, phases, meetingPrompt} = meeting
  const {error, submitMutation, submitting, onCompleted, onError} = useMutationProps()
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const isFacilitator = viewerId === facilitatorUserId

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

  const {isRightDrawerOpen} = meeting

  const handleUpdatePrompt = useEventCallback((newPrompt) => {
    if (submitting) return
    submitMutation()

    UpdateMeetingPromptMutation(atmosphere, {meetingId, newPrompt}, {onError, onCompleted})
  })

  const validate = (rawMeetingPrompt: string) => {
    const res = new Legitity(rawMeetingPrompt)
      .trim()
      .required('Standups need prompts')
      .min(2, 'Standups need good prompts')

    if (res.error) {
      onError(new Error(res.error))
    } else if (error) {
      onCompleted()
    }
    return res
  }

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
              {isFacilitator ? (
                <EditablePrompt
                  error={error?.message}
                  handleSubmit={handleUpdatePrompt}
                  initialValue={meetingPrompt}
                  isWrap
                  maxLength={500}
                  validate={validate}
                  placeholder={'What are you working on today? Stuck on anything?'}
                />
              ) : (
                <Prompt>{meetingPrompt}</Prompt>
              )}
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
            <TeamPromptDiscussionDrawer meetingRef={meeting} isDesktop={isDesktop} />
          </MeetingContent>
        </Suspense>
      </MeetingArea>
    </MeetingStyles>
  )
}

export default TeamPromptMeeting
