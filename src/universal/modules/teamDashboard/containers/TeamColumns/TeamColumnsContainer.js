import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {createFragmentContainer} from 'react-relay';
import ProjectColumns from 'universal/components/ProjectColumns/ProjectColumns';
import {TEAM_DASH} from 'universal/utils/constants';
import getProjectById from 'universal/utils/getProjectById';

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
    this.filterProjects(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const {teamMemberFilterId: oldFilter, viewer: {projects: oldProjects, team: {contentFilter: oldContentFilter}}} = this.props;
    const {teamMemberFilterId, viewer: {projects, team: {contentFilter}}} = nextProps;
    if (oldFilter !== teamMemberFilterId || oldProjects !== projects || oldContentFilter !== contentFilter) {
      this.filterProjects(nextProps);
    }
  }

  filterProjects(props) {
    const {teamMemberFilterId, viewer: {projects, team: {contentFilter, teamMembers}}} = props;
    const contentFilterRegex = new RegExp(contentFilter);
    const contentFilteredEdges = contentFilter ?
      projects.edges.filter(({node}) => {
        const {blocks} = JSON.parse(node.content);
        for (let ii = 0; ii < blocks.length; ii++) {
          const block = blocks[ii];
          if (block.text.match(contentFilterRegex)) {
            return true;
          }
        }
        return false;
      }) : projects.edges;

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
      projects: {
        ...projects,
        edges: edgesWithTeamMembers
      }
    });
  }

  render() {
    const {myTeamMemberId, teamMemberFilterId, viewer: {projects: allProjects}} = this.props;
    const {projects} = this.state;
    return (
      <ProjectColumns
        getProjectById={getProjectById(allProjects)}
        myTeamMemberId={myTeamMemberId}
        projects={projects}
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
      projects(first: 1000, teamId: $teamId) @connection(key: "TeamColumnsContainer_projects") {
        edges {
          node {
            # grab these so we can sort correctly
            id
            status
            sortOrder
            assignee {
              id
            }
            ...DraggableProject_project
          }
        }
      }

    }`
);
