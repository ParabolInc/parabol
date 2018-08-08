// @flow
import * as React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer} from 'react-relay'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import MeetingControlBar from 'universal/modules/meeting/components/MeetingControlBar/MeetingControlBar'
import FlatButton from 'universal/components/FlatButton'
import IconLabel from 'universal/components/IconLabel'
import ui from 'universal/styles/ui'
import appTheme from 'universal/styles/theme/appTheme'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard'
import MeetingAgendaCards from 'universal/modules/meeting/components/MeetingAgendaCards/MeetingAgendaCards'
import findStageAfterId from 'universal/utils/meetings/findStageAfterId'
import EndNewMeetingMutation from 'universal/mutations/EndNewMeetingMutation'
import {withRouter} from 'react-router-dom'
import type {RouterHistory} from 'react-router-dom'
import ScrollableBlock from 'universal/components/ScrollableBlock'
import {connect} from 'react-redux'
import type {Dispatch} from 'redux'
import {meetingTopicPhaseMaxWidth, meetingVoteIcon} from 'universal/styles/meeting'

type Props = {|
  atmosphere: Object,
  dispatch: Dispatch<*>,
  history: RouterHistory,
  gotoNext: () => void,
  // flow or relay-compiler is getting really confused here, so I don't use the flow type here
  team: Object
|}

const DiscussHeader = styled('div')({
  alignItems: 'center',
  display: 'flex',
  margin: '0 0 1.25rem'
})

const TopicHeading = styled('div')({
  fontSize: appTheme.typography.s6,
  position: 'relative',
  '& > span': {
    right: '100%',
    position: 'absolute'
  }
})

const VoteMeta = styled('div')({
  alignItems: 'center',
  backgroundColor: ui.palette.midGray,
  borderRadius: '5em',
  color: ui.palette.white,
  display: 'flex',
  fontSize: ui.iconSize,
  fontWeight: 600,
  margin: '.125rem 0 0 1rem',
  padding: '.125rem .75rem'
})

const VoteIcon = styled(StyledFontAwesome)({
  color: ui.palette.white,
  fontSize: ui.iconSize,
  marginRight: '.125rem',
  width: ui.iconSize
})

const PhaseWrapper = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  overflow: 'hidden'
})

const ReflectionSection = styled('div')({
  borderBottom: `.0625rem solid ${ui.dashBorderColor}`,
  display: 'flex',
  flex: 1,
  flexShrink: 0,
  flexDirection: 'column',
  margin: '0 auto',
  maxWidth: meetingTopicPhaseMaxWidth,
  minHeight: 200,
  width: '100%'
})

const ReflectionSectionInner = styled('div')({
  padding: '0 2.5rem 1.25rem'
})

const ReflectionGrid = styled('div')({
  display: 'grid',
  gridGap: '1.25rem',
  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))'
})

const TaskSection = styled('div')({
  display: 'flex',
  flex: 1,
  height: '10.25rem',
  width: '100%'
})

const TaskCardBlock = styled('div')({
  margin: '0 auto',
  maxWidth: meetingTopicPhaseMaxWidth,
  padding: '1.25rem 2.5rem',
  width: '100%'
})

const ControlButtonBlock = styled('div')({
  width: '12rem'
})

const StyledButton = styled(FlatButton)({
  width: '100%'
})

const SpacedMeetingControlBar = styled(MeetingControlBar)({
  justifyContent: 'space-between'
})

const RetroDiscussPhase = (props: Props) => {
  const {atmosphere, dispatch, gotoNext, history, team} = props
  const {viewerId} = atmosphere
  const {newMeeting, teamId} = team
  const {
    facilitatorUserId,
    localStage: {localStageId, reflectionGroup},
    meetingId,
    phases
  } =
    newMeeting || {}
  // reflection group will be null until the server overwrites the placeholder.
  if (!reflectionGroup) return null
  const {reflectionGroupId, tasks, title, reflections, voteCount} = reflectionGroup
  const isFacilitating = facilitatorUserId === viewerId
  const nextStageRes = findStageAfterId(phases, localStageId)
  const endMeeting = () => {
    EndNewMeetingMutation(atmosphere, {meetingId}, {dispatch, history})
  }
  return (
    <React.Fragment>
      <PhaseWrapper>
        <ReflectionSection>
          <ScrollableBlock>
            <ReflectionSectionInner>
              <DiscussHeader>
                <TopicHeading>
                  <span>{'“'}</span>
                  {`${title}”`}
                </TopicHeading>
                <VoteMeta>
                  <VoteIcon name={meetingVoteIcon} />
                  {voteCount}
                </VoteMeta>
              </DiscussHeader>
              <ReflectionGrid>
                {reflections.map((reflection) => {
                  return (
                    <ReflectionCard
                      key={reflection.id}
                      meeting={newMeeting}
                      reflection={reflection}
                    />
                  )
                })}
              </ReflectionGrid>
            </ReflectionSectionInner>
          </ScrollableBlock>
        </ReflectionSection>
        <TaskSection>
          <ScrollableBlock>
            <TaskCardBlock>
              <MeetingAgendaCards
                meetingId={meetingId}
                reflectionGroupId={reflectionGroupId}
                tasks={tasks}
                teamId={teamId}
              />
            </TaskCardBlock>
          </ScrollableBlock>
        </TaskSection>
      </PhaseWrapper>
      {isFacilitating && (
        <SpacedMeetingControlBar>
          {/* placeholder for layout */}
          <ControlButtonBlock />
          {nextStageRes && (
            <ControlButtonBlock>
              <StyledButton size='medium' onClick={gotoNext}>
                <IconLabel
                  icon='arrow-circle-right'
                  iconColor='warm'
                  iconAfter
                  iconLarge
                  label={'Done! Next topic'}
                />
              </StyledButton>
            </ControlButtonBlock>
          )}
          <ControlButtonBlock>
            <StyledButton size='medium' onClick={endMeeting}>
              <IconLabel
                icon='flag-checkered'
                iconColor='midGray'
                iconLarge
                label={'End Meeting'}
              />
            </StyledButton>
          </ControlButtonBlock>
          {/* placeholder for layout */}
          {!nextStageRes && <ControlButtonBlock />}
        </SpacedMeetingControlBar>
      )}
    </React.Fragment>
  )
}

export default createFragmentContainer(
  connect()(withRouter(withAtmosphere(RetroDiscussPhase))),
  graphql`
    fragment RetroDiscussPhase_team on Team {
      teamId: id
      newMeeting {
        ...ReflectionCard_meeting
        meetingId: id
        facilitatorUserId
        phases {
          stages {
            id
            ... on RetroDiscussStage {
              reflectionGroup {
                id
                tasks {
                  ...NullableTask_task
                }
              }
            }
          }
        }
        localPhase {
          stages {
            id
          }
        }
        localStage {
          localStageId: id
          ... on RetroDiscussStage {
            reflectionGroup {
              reflectionGroupId: id
              title
              voteCount
              reflections {
                id
                ...ReflectionCard_reflection
              }
              tasks {
                id
                reflectionGroupId
                createdAt
                sortOrder
                ...NullableTask_task
              }
            }
          }
        }
      }
    }
  `
)
