import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {createFragmentContainer} from 'react-relay';
import Button from 'universal/components/Button/Button';
import ProjectColumns from 'universal/components/ProjectColumns/ProjectColumns';
import MeetingFacilitationHint from 'universal/modules/meeting/components/MeetingFacilitationHint/MeetingFacilitationHint';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting';
import withStyles from 'universal/styles/withStyles';
import {MEETING} from 'universal/utils/constants';

class MeetingUpdates extends Component {
  state = {projects: {}};

  componentWillMount() {
    this.filterProjects(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const {viewer: {projects: oldProjects}, localPhaseItem: oldLocalPhaseItem} = this.props;
    const {viewer: {projects}, localPhaseItem} = nextProps;
    if (projects !== oldProjects || localPhaseItem !== oldLocalPhaseItem) {
      this.filterProjects(nextProps);
    }
  }

  filterProjects(props) {
    const {localPhaseItem, viewer: {projects, team: {teamMembers}}} = props;
    const currentTeamMember = teamMembers[localPhaseItem - 1];
    const edges = projects.edges.filter(({node}) => node.teamMember.id === currentTeamMember.id);
    this.setState({
      projects: {edges}
    });
  }

  render() {
    const {
      facilitatorName,
      gotoNext,
      localPhaseItem,
      showMoveMeetingControls,
      styles,
      viewer: {team: {teamMembers}}
    } = this.props;
    const {projects} = this.state;
    const self = teamMembers.find((m) => m.isSelf);
    const currentTeamMember = teamMembers[localPhaseItem - 1];
    const isLastMember = localPhaseItem === teamMembers.length;
    const nextPhaseName = actionMeeting.agendaitems.name;
    const myTeamMemberId = self && self.id;
    const {isSelf: isMyMeetingSection} = currentTeamMember;
    return (
      <MeetingMain>
        <MeetingSection flexToFill>
          <div className={css(styles.layout)}>
            {showMoveMeetingControls ?
              <Button
                buttonStyle="flat"
                colorPalette="cool"
                icon="arrow-circle-right"
                iconPlacement="right"
                key={`update${localPhaseItem}`}
                label={isLastMember ? `Move on to the ${nextPhaseName}` : 'Next team member '}
                onClick={gotoNext}
                buttonSize="medium"
              /> :
              <MeetingFacilitationHint>
                {isLastMember ?
                  <span>{'Waiting for '}<b>{facilitatorName}</b> {`to advance to the ${nextPhaseName}`}</span> :
                  <span>{'Waiting for '}<b>{currentTeamMember.preferredName}</b> {`to give ${actionMeeting.updates.name}`}</span>
                }
              </MeetingFacilitationHint>
            }
          </div>
          <div className={css(styles.body)}>
            <ProjectColumns
              alignColumns="center"
              isMyMeetingSection={isMyMeetingSection}
              myTeamMemberId={myTeamMemberId}
              projects={projects}
              area={MEETING}
            />
          </div>
        </MeetingSection>
      </MeetingMain>
    );
  }
}

MeetingUpdates.propTypes = {
  facilitatorName: PropTypes.string.isRequired,
  gotoItem: PropTypes.func.isRequired,
  gotoNext: PropTypes.func.isRequired,
  localPhaseItem: PropTypes.number.isRequired,
  showMoveMeetingControls: PropTypes.bool,
  styles: PropTypes.object,
  viewer: PropTypes.object.isRequired
};

const styleThunk = () => ({
  layout: {
    margin: '0 auto',
    maxWidth: '80rem',
    textAlign: 'center',
    width: '100%'
  },

  body: {
    display: 'flex',
    flex: 1,
    padding: '1rem 1rem 0',
    width: '100%'
  }
});

export default createFragmentContainer(
  withStyles(styleThunk)(MeetingUpdates),
  graphql`
    fragment MeetingUpdates_viewer on User {
      team(teamId: $teamId) {
        teamMembers(sortBy: "checkInOrder") {
          id
          isSelf
          preferredName
        }
      }
      projects(first: 1000, teamId: $teamId) @connection(key: "TeamColumnsContainer_projects") {
        edges {
          node {
            # grab these so we can sort correctly
            id
            status
            sortOrder
            teamMember {
              id
            }
            ...DraggableProject_project
          }
        }
      }
    }`
);
