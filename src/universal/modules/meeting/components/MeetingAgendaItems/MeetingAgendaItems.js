import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import FlatButton from 'universal/components/FlatButton'
import IconLabel from 'universal/components/IconLabel'
import BounceBlock from 'universal/components/BounceBlock/BounceBlock'
import EditorHelpModalContainer from 'universal/containers/EditorHelpModalContainer/EditorHelpModalContainer'
import MeetingAgendaCards from 'universal/modules/meeting/components/MeetingAgendaCards/MeetingAgendaCards'
import MeetingFacilitationHint from 'universal/modules/meeting/components/MeetingFacilitationHint/MeetingFacilitationHint'
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain'
import MeetingPrompt from 'universal/modules/meeting/components/MeetingPrompt/MeetingPrompt'
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection'
import MeetingControlBar from 'universal/modules/meeting/components/MeetingControlBar/MeetingControlBar'
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting'
import {AGENDA_ITEMS} from 'universal/utils/constants'
import EndMeetingMutation from 'universal/mutations/EndMeetingMutation'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import {withRouter} from 'react-router'
import styled from 'react-emotion'
import {meetingTopicPhaseMaxWidth} from 'universal/styles/meeting'

const Layout = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  margin: '0 auto',
  maxWidth: meetingTopicPhaseMaxWidth,
  padding: '0 .75rem',
  width: '100%'
})

const Prompt = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center'
})

const Nav = styled('div')({
  paddingTop: '1rem',
  textAlign: 'center',
  width: '100%'
})

const TaskCardBlock = styled('div')({
  flex: 1,
  overflow: 'auto',
  padding: '.5rem .5rem 1.25rem',
  width: '100%'
})

const ControlButtonBlock = styled('div')({
  width: '12rem'
})

const SpacedMeetingControlBar = styled(MeetingControlBar)({
  justifyContent: 'space-between'
})

class MeetingAgendaItems extends Component {
  state = {agendaTasks: []}

  componentWillMount () {
    this.makeAgendaTasks(this.props)
  }

  componentWillReceiveProps (nextProps) {
    const {
      viewer: {tasks: oldTasks},
      localPhaseItem: oldLocalPhaseItem
    } = this.props
    const {
      viewer: {tasks},
      localPhaseItem
    } = nextProps
    if (tasks !== oldTasks || localPhaseItem !== oldLocalPhaseItem) {
      this.makeAgendaTasks(nextProps)
    }
  }

  makeAgendaTasks (props) {
    const {
      localPhaseItem,
      viewer: {
        team: {agendaItems},
        tasks
      }
    } = props
    const agendaItem = agendaItems[localPhaseItem - 1]
    const agendaTasks = tasks.edges
      .map(({node}) => node)
      .filter((node) => node.agendaId === agendaItem.id)
      .sort((a, b) => (a.sortOrder < b.sortOrder ? 1 : -1))

    this.setState({
      agendaTasks
    })
  }

  render () {
    const {
      atmosphere,
      history,
      facilitatorName,
      gotoNext,
      hideMoveMeetingControls,
      localPhaseItem,
      showMoveMeetingControls,
      viewer: {team}
    } = this.props
    const {agendaTasks} = this.state
    const {agendaItems, id: teamId, teamMembers} = team
    const agendaItem = agendaItems[localPhaseItem - 1]
    const currentTeamMember = teamMembers.find((m) => m.id === agendaItem.teamMember.id)
    const subHeading = (
      <span>
        <b>{currentTeamMember.preferredName}</b>
        {', what do you need?'}
      </span>
    )
    const endMeeting = () => {
      EndMeetingMutation(atmosphere, teamId, history)
    }
    return (
      <MeetingMain hasHelpFor={AGENDA_ITEMS} isFacilitating={showMoveMeetingControls}>
        <MeetingSection flexToFill>
          <MeetingSection flexToFill>
            <Layout>
              <Prompt>
                <MeetingPrompt
                  avatar={currentTeamMember.picture}
                  heading={`“${agendaItem.content}”`}
                  subHeading={subHeading}
                />
              </Prompt>
              <Nav>
                {hideMoveMeetingControls && (
                  <MeetingFacilitationHint>
                    {'Waiting for'} <b>{facilitatorName}</b>{' '}
                    {`to wrap up the ${actionMeeting.agendaitems.name}`}
                  </MeetingFacilitationHint>
                )}
              </Nav>
              <TaskCardBlock>
                <MeetingAgendaCards agendaId={agendaItem.id} tasks={agendaTasks} teamId={team.id} />
              </TaskCardBlock>
              <EditorHelpModalContainer />
            </Layout>
          </MeetingSection>
        </MeetingSection>
        {showMoveMeetingControls && (
          <SpacedMeetingControlBar>
            <ControlButtonBlock />
            <BounceBlock animationDelay='120s' key={`agendaItem${localPhaseItem}buttonAnimation`}>
              <FlatButton size='medium' key={`agendaItem${localPhaseItem}`} onClick={gotoNext}>
                <IconLabel
                  icon='arrow-circle-right'
                  iconAfter
                  iconColor='warm'
                  iconLarge
                  label='Done! Next…'
                />
              </FlatButton>
            </BounceBlock>
            <ControlButtonBlock>
              <FlatButton size='medium' onClick={endMeeting}>
                <IconLabel
                  icon='flag-checkered'
                  iconColor='midGray'
                  iconLarge
                  label={'End Meeting'}
                />
              </FlatButton>
            </ControlButtonBlock>
          </SpacedMeetingControlBar>
        )}
      </MeetingMain>
    )
  }
}

MeetingAgendaItems.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  facilitatorName: PropTypes.string.isRequired,
  gotoNext: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  hideMoveMeetingControls: PropTypes.bool,
  localPhaseItem: PropTypes.number.isRequired,
  showMoveMeetingControls: PropTypes.bool,
  viewer: PropTypes.object
}

export default createFragmentContainer(
  withAtmosphere(withRouter(MeetingAgendaItems)),
  graphql`
    fragment MeetingAgendaItems_viewer on User {
      team(teamId: $teamId) {
        id
        agendaItems {
          id
          content
          teamMember {
            id
          }
        }
        teamMembers(sortBy: "checkInOrder") {
          id
          picture
          preferredName
        }
      }
      tasks(first: 1000, teamId: $teamId) @connection(key: "TeamColumnsContainer_tasks") {
        edges {
          node {
            id
            agendaId
            createdAt
            sortOrder
            ...NullableTask_task
          }
        }
      }
    }
  `
)
