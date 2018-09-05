import {RetroDiscussPhase_team} from '__generated__/RetroDiscussPhase_team.graphql'
import React from 'react'
import styled from 'react-emotion'
import {connect} from 'react-redux'
import {createFragmentContainer, graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import {Dispatch} from 'redux'
import FlatButton from 'universal/components/FlatButton'
import IconLabel from 'universal/components/IconLabel'
import LabelHeading from 'universal/components/LabelHeading/LabelHeading'
import DiscussHelpMenu from 'universal/components/MeetingHelp/DiscussHelpMenu'
import Overflow from 'universal/components/Overflow'
import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import MeetingControlBar from 'universal/modules/meeting/components/MeetingControlBar/MeetingControlBar'
import EndNewMeetingMutation from 'universal/mutations/EndNewMeetingMutation'
import {meetingGridGap, meetingGridMinWidth, meetingVoteIcon} from 'universal/styles/meeting'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import findStageAfterId from 'universal/utils/meetings/findStageAfterId'
import plural from 'universal/utils/plural'
import MeetingAgendaCards from 'universal/modules/meeting/components/MeetingAgendaCards/MeetingAgendaCards'
import handleRightArrow from '../utils/handleRightArrow'

interface PassedProps {
  gotoNext: () => void
  gotoNextRef: React.RefObject<HTMLDivElement>
  team: RetroDiscussPhase_team
}

interface Props extends WithAtmosphereProps, RouteComponentProps<{}>, PassedProps {
  dispatch: Dispatch<{}>
}

const maxWidth = '114rem'

const HeaderContainer = styled('div')({
  margin: '0 auto',
  maxWidth,
  padding: '0 1.25rem'
})

const LabelContainer = styled('div')({
  margin: '0 1.25rem',
  padding: '0 0 .625rem'
})

const DiscussHeader = styled('div')({
  alignItems: 'center',
  display: 'flex',
  margin: '0 0 1.25rem'
})

const ColumnsContainer = styled('div')({
  display: 'flex',
  flex: 1,
  margin: '0 auto',
  maxWidth,
  overflowX: 'auto',
  padding: 0,
  width: '100%'
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

const ReflectionGrid = styled('div')({
  display: 'grid',
  gridGap: meetingGridGap,
  gridTemplateColumns: `repeat(auto-fill, minmax(${meetingGridMinWidth}, 1fr))`
})

const Column = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  width: '100%'
})

const TaskColumn = styled(Column)({
  borderLeft: '.0625rem solid rgba(0, 0, 0, .05)'
})

const ColumnInner = styled('div')({
  padding: '.625rem 1.25rem 1.25rem',
  width: '100%'
})

const TaskCardBlock = styled('div')({
  margin: '0 auto',
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
  const {atmosphere, dispatch, gotoNext, gotoNextRef, history, team} = props
  const {viewerId} = atmosphere
  const {newMeeting, teamId} = team
  if (!newMeeting) return null
  const {
    facilitatorUserId,
    localStage: {localStageId, reflectionGroup},
    meetingId,
    phases
  } = newMeeting
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
        <HeaderContainer>
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
        </HeaderContainer>
        <ColumnsContainer>
          <Column>
            <LabelContainer>
              <LabelHeading>
                {reflections.length} {plural(reflections.length, 'Reflection')}
              </LabelHeading>
            </LabelContainer>
            <Overflow>
              <ColumnInner>
                <ReflectionGrid>
                  {reflections.map((reflection) => {
                    return <ReflectionCard key={reflection.id} reflection={reflection} />
                  })}
                </ReflectionGrid>
              </ColumnInner>
            </Overflow>
          </Column>
          <TaskColumn>
            <LabelContainer>
              <LabelHeading>Takeaway Tasks</LabelHeading>
            </LabelContainer>
            <Overflow>
              <ColumnInner>
                <TaskCardBlock>
                  <MeetingAgendaCards
                    meetingId={meetingId}
                    reflectionGroupId={reflectionGroupId}
                    tasks={tasks}
                    teamId={teamId}
                  />
                </TaskCardBlock>
              </ColumnInner>
            </Overflow>
          </TaskColumn>
        </ColumnsContainer>
      </PhaseWrapper>
      {isFacilitating && (
        <SpacedMeetingControlBar>
          {/* placeholder for layout */}
          <ControlButtonBlock />
          {nextStageRes && (
            <ControlButtonBlock>
              <StyledButton
                size="medium"
                onClick={gotoNext}
                innerRef={gotoNextRef}
                onKeyDown={handleRightArrow(gotoNext)}
              >
                <IconLabel
                  icon="arrow-circle-right"
                  iconColor="warm"
                  iconAfter
                  iconLarge
                  label={'Done! Next topic'}
                />
              </StyledButton>
            </ControlButtonBlock>
          )}
          <ControlButtonBlock>
            <StyledButton size="medium" onClick={endMeeting}>
              <IconLabel
                icon="flag-checkered"
                iconColor="midGray"
                iconLarge
                label={'End Meeting'}
              />
            </StyledButton>
          </ControlButtonBlock>
          {/* placeholder for layout */}
          {!nextStageRes && <ControlButtonBlock />}
        </SpacedMeetingControlBar>
      )}
      <DiscussHelpMenu floatAboveBottomBar={isFacilitating} />
    </React.Fragment>
  )
}

export default createFragmentContainer<PassedProps>(
  (connect as any)()(withRouter(withAtmosphere(RetroDiscussPhase))),
  graphql`
    fragment RetroDiscussPhase_team on Team {
      teamId: id
      newMeeting {
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
