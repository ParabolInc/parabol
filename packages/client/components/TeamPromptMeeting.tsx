import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {Suspense, useMemo} from 'react'
import {useFragment} from 'react-relay'
import useBreakpoint from '~/hooks/useBreakpoint'
import useMeeting from '~/hooks/useMeeting'
import useTransition, {TransitionStatus} from '~/hooks/useTransition'
import {BezierCurve, Breakpoint, DiscussionThreadEnum} from '~/types/constEnums'
import {isNotNull} from '~/utils/predicates'
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

const Dimensions = {
  RESPONSE_WIDTH: 296,
  RESPONSE_MIN_HEIGHT: 100
}

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

const TeamMemberResponse = styled('div')<{
  status: TransitionStatus
}>(({status}) => ({
  opacity: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 0 : 1,
  transition: `box-shadow 100ms ${BezierCurve.DECELERATE}, opacity 300ms ${BezierCurve.DECELERATE}`,
  display: 'flex',
  flexDirection: 'column',
  width: Dimensions.RESPONSE_WIDTH,
  flexShrink: 0
}))

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
              ...TeamPromptResponseCard_stage
              ... on TeamPromptResponseStage {
                discussionId
              }
            }
          }
        }
      }
    `,
    meetingRef
  )
  const {phases} = meeting
  const maybeTabletPlus = useBreakpoint(Breakpoint.FUZZY_TABLET)

  const phase = getPhaseByTypename(phases, 'TeamPromptResponsesPhase')
  const stages = useMemo(() => {
    return phase.stages
      .map((stage) => {
        return {
          ...stage,
          key: stage.id
        }
      })
      .filter(isNotNull)
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
                      const {key} = stage

                      return (
                        <TeamMemberResponse
                          key={key}
                          status={status}
                          onTransitionEnd={onTransitionEnd}
                        >
                          <TeamPromptResponseCard stageRef={stage} />
                        </TeamMemberResponse>
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
