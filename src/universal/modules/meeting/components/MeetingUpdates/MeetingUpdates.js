import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {createFragmentContainer} from 'react-relay';
import Button from 'universal/components/Button/Button';
import TaskColumns from 'universal/components/TaskColumns/TaskColumns';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting';
import withStyles from 'universal/styles/withStyles';
import {MEETING} from 'universal/utils/constants';
import getTaskById from 'universal/utils/getTaskById';
import isTaskPrivate from 'universal/utils/isTaskPrivate';

class MeetingUpdates extends Component {
  state = {tasks: {}};

  componentWillMount() {
    this.filterTasks(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const {viewer: {tasks: oldTasks}, localPhaseItem: oldLocalPhaseItem} = this.props;
    const {viewer: {tasks}, localPhaseItem} = nextProps;
    if (tasks !== oldTasks || localPhaseItem !== oldLocalPhaseItem) {
      this.filterTasks(nextProps);
    }
  }

  filterTasks(props) {
    const {localPhaseItem, setUpdateUserHasTasks, viewer: {tasks, team: {teamMembers}}} = props;
    const currentTeamMember = teamMembers[localPhaseItem - 1];
    const edges = tasks.edges.filter(({node}) => node.assignee.id === currentTeamMember.id && !isTaskPrivate(node.tags));
    this.setState({
      tasks: {edges}
    });
    setUpdateUserHasTasks(Boolean(edges.length));
  }

  render() {
    const {
      gotoNext,
      localPhaseItem,
      showMoveMeetingControls,
      styles,
      viewer: {team: {teamMembers}, tasks: allTasks}
    } = this.props;
    const {tasks} = this.state;
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
            {showMoveMeetingControls &&
              <Button
                buttonStyle="flat"
                colorPalette="cool"
                icon="arrow-circle-right"
                iconPlacement="right"
                key={`update${localPhaseItem}`}
                label={isLastMember ? `Advance to the ${nextPhaseName}` : 'Next teammate '}
                onClick={gotoNext}
                buttonSize="medium"
              />
            }
          </div>
          <div className={css(styles.body)}>
            <TaskColumns
              alignColumns="center"
              getTaskById={getTaskById(allTasks)}
              isMyMeetingSection={isMyMeetingSection}
              myTeamMemberId={myTeamMemberId}
              tasks={tasks}
              area={MEETING}
            />
          </div>
        </MeetingSection>
      </MeetingMain>
    );
  }
}

MeetingUpdates.propTypes = {
  gotoItem: PropTypes.func.isRequired,
  gotoNext: PropTypes.func.isRequired,
  localPhaseItem: PropTypes.number.isRequired,
  showMoveMeetingControls: PropTypes.bool,
  setUpdateUserHasTasks: PropTypes.func.isRequired,
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
      tasks(first: 1000, teamId: $teamId) @connection(key: "TeamColumnsContainer_tasks") {
        edges {
          node {
            # grab these so we can sort correctly
            id
            status
            sortOrder
            tags
            assignee {
              id
            }
            ...DraggableTask_task
          }
        }
      }
    }`
);
