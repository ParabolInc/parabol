import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {Suspense, useMemo} from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useBreakpoint from '~/hooks/useBreakpoint'
import useMeeting from '~/hooks/useMeeting'
import useTransition from '~/hooks/useTransition'
import {Breakpoint, DiscussionThreadEnum} from '~/types/constEnums'
import {isNotNull} from '~/utils/predicates'
import sortByISO8601Date from '~/utils/sortByISO8601Date'
import {TeamPromptMeeting_meeting$key} from '~/__generated__/TeamPromptMeeting_meeting.graphql'
import getPhaseByTypename from '../utils/getPhaseByTypename'
import ErrorBoundary from './ErrorBoundary'
import MeetingArea from './MeetingArea'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingStyles from './MeetingStyles'
import TeamPromptDiscussionDrawer from './TeamPrompt/TeamPromptDiscussionDrawer'
import TeamPromptResponseCard from './TeamPrompt/TeamPromptResponseCard'
import TeamPromptTopBar from './TeamPrompt/TeamPromptTopBar'

const Prompt = styled('h1')({
  textAlign: 'center',
  margin: 16,
  fontSize: 20,
  lineHeight: '32px',
  fontWeight: 400
})

const ResponsesGridContainer = styled('div')<{maybeTabletPlus: boolean}>(({maybeTabletPlus}) => ({
  height: '100%',
  overflow: 'auto',
  padding: maybeTabletPlus ? '32px 10%' : 16
}))

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
        isRightDrawerOpen
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
  const {phases} = meeting
  const maybeTabletPlus = useBreakpoint(Breakpoint.FUZZY_TABLET)
  const {viewerId} = useAtmosphere()

  const phase = getPhaseByTypename(phases, 'TeamPromptResponsesPhase')
  const stages = useMemo(() => {
    const allStages = phase.stages.filter(isNotNull)

    const nonViewerStages = allStages.filter((stage) => stage.teamMember.userId !== viewerId)
    const orderedNonEmptyStages = nonViewerStages
      .filter((stage) => !!stage.response?.plaintextContent)
      .sort((stageA, stageB) =>
        sortByISO8601Date(stageA.response!.createdAt, stageB.response!.createdAt)
      )
    const orderedEmptyStages = nonViewerStages.filter((stage) => !stage.response?.plaintextContent)
    let orderedStages = [...orderedNonEmptyStages, ...orderedEmptyStages]

    // Find the viewer's card.
    const viewerCardIndex = allStages.findIndex((stage) => stage.teamMember.userId === viewerId)
    if (viewerCardIndex !== -1) {
      orderedStages = [allStages[viewerCardIndex]!, ...orderedStages]
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
              <Prompt>What are you working on today? Stuck on anything?</Prompt>
              <ErrorBoundary>
                <ResponsesGridContainer maybeTabletPlus={maybeTabletPlus}>
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
