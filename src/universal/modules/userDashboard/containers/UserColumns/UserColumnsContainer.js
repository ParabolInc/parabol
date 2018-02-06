import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {createFragmentContainer} from 'react-relay';
import TaskColumns from 'universal/components/TaskColumns/TaskColumns';
import {USER_DASH} from 'universal/utils/constants';
import getTaskById from 'universal/utils/getTaskById';

const mapStateToProps = (state) => {
  return {
    teamFilterId: state.userDashboard.teamFilterId
  };
};

class UserColumnsContainer extends Component {
  componentWillMount() {
    this.filterByTeamMember(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const {teamFilterId: oldFilter, viewer: {tasks: oldTasks}} = this.props;
    const {teamFilterId, viewer: {tasks}} = nextProps;
    if (oldFilter !== teamFilterId || oldTasks !== tasks) {
      this.filterByTeamMember(nextProps);
    }
  }

  filterByTeamMember(props) {
    const {teamFilterId, viewer: {tasks}} = props;
    const edges = teamFilterId ?
      tasks.edges.filter(({node}) => node.team.id === teamFilterId) :
      tasks.edges;
    this.setState({
      tasks: {
        ...tasks,
        edges
      }
    });
  }

  render() {
    const {teams, userId, viewer: {tasks: allTasks}} = this.props;
    const {tasks} = this.state;
    return (
      <TaskColumns
        area={USER_DASH}
        getTaskById={getTaskById(allTasks)}
        tasks={tasks}
        teams={teams}
        userId={userId}
      />
    );
  }
}

UserColumnsContainer.propTypes = {
  tasks: PropTypes.object,
  teams: PropTypes.array,
  teamFilterId: PropTypes.string,
  userId: PropTypes.string,
  viewer: PropTypes.object
};


export default createFragmentContainer(
  connect(mapStateToProps)(UserColumnsContainer),
  graphql`
    fragment UserColumnsContainer_viewer on User {
      tasks(first: 1000) @connection(key: "UserColumnsContainer_tasks") {
        edges {
          node {
            # grab these so we can sort correctly
            id
            status
            sortOrder
            team {
              id
            }
            ...DraggableTask_task
          }
        }
      }
    }
  `
);
