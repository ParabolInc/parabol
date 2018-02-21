import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {createFragmentContainer} from 'react-relay';
import TaskColumns from 'universal/components/TaskColumns/TaskColumns';
import {TEAM_DASH} from 'universal/utils/constants';
import getTaskById from 'universal/utils/getTaskById';

const mapStateToProps = (state, props) => {
  const {teamId} = props;
  const {teamMemberFilterId} = state.teamDashboard;
  const userId = state.auth.obj.sub;
  return {
    myTeamMemberId: `${userId}::${teamId}`,
    teamMemberFilterId
  };
};


class TeamColumnsContainer extends Component {
  componentWillMount() {
    this.filterTasks(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const {teamMemberFilterId: oldFilter, viewer: {tasks: oldTasks, team: {contentFilter: oldContentFilter}}} = this.props;
    const {teamMemberFilterId, viewer: {tasks, team: {contentFilter}}} = nextProps;
    if (oldFilter !== teamMemberFilterId || oldTasks !== tasks || oldContentFilter !== contentFilter) {
      this.filterTasks(nextProps);
    }
  }

  filterTasks(props) {
    const {teamMemberFilterId, viewer: {tasks, team: {contentFilter, teamMembers}}} = props;
    const contentFilterRegex = new RegExp(contentFilter);
    const contentFilteredEdges = contentFilter ?
      tasks.edges.filter(({node}) => {
        const {blocks} = JSON.parse(node.content);
        for (let ii = 0; ii < blocks.length; ii++) {
          const block = blocks[ii];
          if (block.text.match(contentFilterRegex)) {
            return true;
          }
        }
        return false;
      }) : tasks.edges;

    const teamMemberFilteredEdges = teamMemberFilterId ?
      contentFilteredEdges.filter(({node}) => node.assignee.id === teamMemberFilterId) :
      contentFilteredEdges;

    const edgesWithTeamMembers = teamMemberFilteredEdges.map((edge) => {
      return {
        ...edge,
        node: {
          ...edge.node,
          teamMembers
        }
      };
    });
    this.setState({
      tasks: {
        ...tasks,
        edges: edgesWithTeamMembers
      }
    });
  }

  render() {
    const {myTeamMemberId, teamMemberFilterId, viewer: {tasks: allTasks}} = this.props;
    const {tasks} = this.state;
    return (
      <TaskColumns
        getTaskById={getTaskById(allTasks)}
        myTeamMemberId={myTeamMemberId}
        tasks={tasks}
        teamMemberFilterId={teamMemberFilterId}
        area={TEAM_DASH}
      />
    );
  }
}

TeamColumnsContainer.propTypes = {
  myTeamMemberId: PropTypes.string,
  teamId: PropTypes.string.isRequired,
  teamMemberFilterId: PropTypes.string,
  viewer: PropTypes.object.isRequired
};

export default createFragmentContainer(
  connect(mapStateToProps)(TeamColumnsContainer),
  graphql`
    fragment TeamColumnsContainer_viewer on User {
      team(teamId: $teamId) {
        contentFilter
        teamMembers(sortBy: "preferredName") {
          id
          picture
          preferredName
        }
      }
      tasks(first: 1000, teamId: $teamId) @connection(key: "TeamColumnsContainer_tasks") {
        edges {
          node {
            # grab these so we can sort correctly
            id
            content
            status
            sortOrder
            assignee {
              id
            }
            ...DraggableTask_task
          }
        }
      }

    }`
);
