import {RetroDiscussPhase_team} from '__generated__/RetroDiscussPhase_team.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import BottomNavControl from 'universal/components/BottomNavControl'
import BottomNavIconLabel from 'universal/components/BottomNavIconLabel'
import DiscussPhaseReflectionGrid from 'universal/components/DiscussPhaseReflectionGrid'
import ErrorBoundary from 'universal/components/ErrorBoundary'
import Icon from 'universal/components/Icon'
import LabelHeading from 'universal/components/LabelHeading/LabelHeading'
import MeetingContent from 'universal/components/MeetingContent'
import MeetingContentHeader from 'universal/components/MeetingContentHeader'
import MeetingHelpToggle from 'universal/components/MenuHelpToggle'
import PhaseHeaderDescription from 'universal/components/PhaseHeaderDescription'
import PhaseHeaderTitle from 'universal/components/PhaseHeaderTitle'
import Overflow from 'universal/components/Overflow'
import {RetroMeetingPhaseProps} from 'universal/components/RetroMeeting'
import EditorHelpModalContainer from 'universal/containers/EditorHelpModalContainer/EditorHelpModalContainer'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import MeetingAgendaCards from 'universal/modules/meeting/components/MeetingAgendaCards/MeetingAgendaCards'
import MeetingControlBar from 'universal/modules/meeting/components/MeetingControlBar/MeetingControlBar'
import {MD_ICONS_SIZE_18} from 'universal/styles/icons'
import {meetingVoteIcon} from 'universal/styles/meeting'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import {NewMeetingPhaseTypeEnum} from 'universal/types/graphql'
import lazyPreload from 'universal/utils/lazyPreload'
import findStageAfterId from 'universal/utils/meetings/findStageAfterId'
import plural from 'universal/utils/plural'
import handleRightArrow from '../utils/handleRightArrow'
import isDemoRoute from '../utils/isDemoRoute'
import EndMeetingButton from './EndMeetingButton'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'

interface Props extends WithAtmosphereProps, RetroMeetingPhaseProps {
  team: RetroDiscussPhase_team
}

const maxWidth = '114rem'

const HeaderContainer = styled('div')({
  margin: '0 auto',
  maxWidth,
  padding: '0 1.25rem',
  userSelect: 'none'
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

const VoteIcon = styled(Icon)({
  color: ui.palette.white,
  fontSize: MD_ICONS_SIZE_18,
  marginRight: '.125rem'
})

const PhaseWrapper = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  overflow: 'hidden'
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

const BottomControlSpacer = styled('div')({
  minWidth: '6rem'
})

const StyledBottomBar = styled(MeetingControlBar)({
  justifyContent: 'space-between'
})

const DiscussHelpMenu = lazyPreload(async () =>
  import(/* webpackChunkName: 'DiscussHelpMenu' */ 'universal/components/MeetingHelp/DiscussHelpMenu')
)
const DemoDiscussHelpMenu = lazyPreload(async () =>
  import(/* webpackChunkName: 'DemoDiscussHelpMenu' */ 'universal/components/MeetingHelp/DemoDiscussHelpMenu')
)

const RetroDiscussPhase = (props: Props) => {
  const {avatarGroup, toggleSidebar, atmosphere, handleGotoNext, team, isDemoStageComplete} = props
  const {viewerId} = atmosphere
  const {isMeetingSidebarCollapsed, newMeeting, teamId} = team
  if (!newMeeting) return null
  const {current} = handleGotoNext
  const {gotoNext, ref: gotoNextRef} = current
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
  return (
    <MeetingContent>
      <MeetingContentHeader
        avatarGroup={avatarGroup}
        isMeetingSidebarCollapsed={!!isMeetingSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      >
        <PhaseHeaderTitle>{phaseLabelLookup[NewMeetingPhaseTypeEnum.discuss]}</PhaseHeaderTitle>
        <PhaseHeaderDescription>
          {'Create takeaway task cards to capture next steps'}
        </PhaseHeaderDescription>
      </MeetingContentHeader>
      <ErrorBoundary>
        <PhaseWrapper>
          <HeaderContainer>
            <DiscussHeader>
              <TopicHeading>{`“${title}”`}</TopicHeading>
              <VoteMeta>
                <VoteIcon>{meetingVoteIcon}</VoteIcon>
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
                  <DiscussPhaseReflectionGrid reflections={reflections} />
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
          <StyledBottomBar>
            <BottomControlSpacer />
            {nextStageRes && (
              <React.Fragment>
                <BottomNavControl
                  isBouncing={isDemoStageComplete}
                  onClick={() => gotoNext()}
                  innerRef={gotoNextRef}
                  onKeyDown={handleRightArrow(() => gotoNext())}
                >
                  <BottomNavIconLabel icon='arrow_forward' iconColor='warm' label={'Next Topic'} />
                </BottomNavControl>
              </React.Fragment>
            )}
            <EndMeetingButton meetingId={meetingId} />
            {!nextStageRes && <BottomControlSpacer />}
          </StyledBottomBar>
        )}
        <MeetingHelpToggle
          floatAboveBottomBar={isFacilitating}
          menu={isDemoRoute() ? <DemoDiscussHelpMenu /> : <DiscussHelpMenu />}
        />

        <EditorHelpModalContainer />
      </ErrorBoundary>
    </MeetingContent>
  )
}

export default createFragmentContainer(
  withAtmosphere(RetroDiscussPhase),
  graphql`
    fragment RetroDiscussPhase_team on Team {
      isMeetingSidebarCollapsed
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
                  ...MeetingAgendaCards_tasks
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
                ...DiscussPhaseReflectionGrid_reflections
              }
              tasks {
                id
                reflectionGroupId
                content
                createdAt
                sortOrder
                ...MeetingAgendaCards_tasks
              }
            }
          }
        }
      }
    }
  `
)
