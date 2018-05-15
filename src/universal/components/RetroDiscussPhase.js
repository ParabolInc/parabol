// @flow
import * as React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer} from 'react-relay'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import MeetingControlBar from 'universal/modules/meeting/components/MeetingControlBar/MeetingControlBar'
import Button from 'universal/components/Button/Button'
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

type Props = {|
  atmosphere: Object,
  history: RouterHistory,
  gotoNext: () => void,
  // flow or relay-compiler is getting really confused here, so I don't use the flow type here
  team: Object
|}

const DiscussHeader = styled('div')({
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

const CheckColumn = styled('div')({
  display: 'flex'
})

const CheckIcon = styled(StyledFontAwesome)(({color}) => ({
  color,
  marginRight: '.25rem',
  width: ui.iconSize
}))

const PhaseWrapper = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  overflow: 'hidden'
})

const ReflectionSection = styled('div')({
  borderBottom: `.0625rem solid ${ui.dashBorderColor}`,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  margin: '0 auto',
  maxHeight: '35%',
  maxWidth: ui.meetingTopicPhaseMaxWidth,
  width: '100%',

  [ui.breakpoint.wide]: {
    maxHeight: '40%'
  },

  [ui.breakpoint.wider]: {
    maxHeight: '45%'
  },

  [ui.breakpoint.widest]: {
    maxHeight: '50%'
  }
})

const ReflectionSectionInner = styled('div')({
  padding: '0 1.375rem .875rem 2.5rem'
})

const ReflectionGrid = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, calc(100% / 3))'
})

const ReflectionGridBlock = styled('div')({
  margin: '0 1.125rem 1.125rem 0'
})

const TaskCardBlock = styled('div')({
  margin: '0 auto',
  maxWidth: ui.meetingTopicPhaseMaxWidth,
  padding: '1rem 2rem',
  width: '100%',

  [ui.breakpoint.wide]: {
    paddingLeft: '1.75rem',
    paddingRight: '1.75rem'
  },

  [ui.breakpoint.wider]: {
    paddingLeft: '1.5rem',
    paddingRight: '1.5rem'
  }
})

const ControlButtonBlock = styled('div')({
  width: '12rem'
})

const SpacedMeetingControlBar = styled(MeetingControlBar)({
  justifyContent: 'space-between'
})

const RetroDiscussPhase = (props: Props) => {
  const {atmosphere, gotoNext, history, team} = props
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
  const checkMarks = [...Array(voteCount).keys()]
  const nextStageRes = findStageAfterId(phases, localStageId)
  const endMeeting = () => {
    EndNewMeetingMutation(atmosphere, {meetingId}, {history})
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
                <CheckColumn>
                  {checkMarks.map((idx) => (
                    <CheckIcon key={idx} name='check' color={ui.palette.mid} />
                  ))}
                </CheckColumn>
              </DiscussHeader>
              <ReflectionGrid>
                {reflections.map((reflection) => {
                  return (
                    <ReflectionGridBlock key={`GridBlock-${reflection.id}`}>
                      <ReflectionCard
                        key={reflection.id}
                        meeting={newMeeting}
                        reflection={reflection}
                      />
                    </ReflectionGridBlock>
                  )
                })}
              </ReflectionGrid>
            </ReflectionSectionInner>
          </ScrollableBlock>
        </ReflectionSection>
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
      </PhaseWrapper>
      {isFacilitating && (
        <SpacedMeetingControlBar>
          {/* placeholder for layout */}
          <ControlButtonBlock />
          {nextStageRes && (
            <ControlButtonBlock>
              <Button
                buttonSize='medium'
                buttonStyle='flat'
                colorPalette='dark'
                icon='arrow-circle-right'
                iconLarge
                iconPalette='warm'
                iconPlacement='right'
                isBlock
                label={'Done! Next topic'}
                onClick={gotoNext}
              />
            </ControlButtonBlock>
          )}
          <ControlButtonBlock>
            <Button
              buttonSize='medium'
              buttonStyle='flat'
              colorPalette='dark'
              icon='flag-checkered'
              iconLarge
              iconPalette='midGray'
              iconPlacement='left'
              isBlock
              label={'End Meeting'}
              onClick={endMeeting}
            />
          </ControlButtonBlock>
          {/* placeholder for layout */}
          {!nextStageRes && <ControlButtonBlock />}
        </SpacedMeetingControlBar>
      )}
    </React.Fragment>
  )
}

export default createFragmentContainer(
  withRouter(withAtmosphere(RetroDiscussPhase)),
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
