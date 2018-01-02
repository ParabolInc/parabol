import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {createFragmentContainer} from 'react-relay';
import ProjectColumns from 'universal/components/ProjectColumns/ProjectColumns';
import {USER_DASH} from 'universal/utils/constants';

const mapStateToProps = (state) => {
  return {
    teamFilterId: state.userDashboard.teamFilterId
  };
};

class UserColumnsContainer extends Component {
  getProjectById = (projectId) =>
    this.props.viewer.projects.edges
      .map(({ node }) => node)
      .find(({ id }) => projectId === id);

  componentWillMount() {
    this.filterByTeamMember(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const {teamFilterId: oldFilter, viewer: {projects: oldProjects}} = this.props;
    const {teamFilterId, viewer: {projects}} = nextProps;
    if (oldFilter !== teamFilterId || oldProjects !== projects) {
      this.filterByTeamMember(nextProps);
    }
  }

  filterByTeamMember(props) {
    const {teamFilterId, viewer: {projects}} = props;
    const edges = teamFilterId ?
      projects.edges.filter(({node}) => node.team.id === teamFilterId) :
      projects.edges;
    this.setState({
      projects: {
        ...projects,
        edges
      }
    });
  }

  render() {
    const {teams, userId} = this.props;
    const {projects} = this.state;
    return (
      <ProjectColumns
        area={USER_DASH}
        getProjectById={this.getProjectById}
        projects={projects}
        teams={teams}
        userId={userId}
      />
    );
  }
}

UserColumnsContainer.propTypes = {
  projects: PropTypes.object,
  teams: PropTypes.array,
  teamFilterId: PropTypes.string,
  userId: PropTypes.string,
  viewer: PropTypes.object
};


export default createFragmentContainer(
  connect(mapStateToProps)(UserColumnsContainer),
  graphql`
    fragment UserColumnsContainer_viewer on User {
      projects(first: 1000) @connection(key: "UserColumnsContainer_projects") {
        edges {
          node {
            # grab these so we can sort correctly
            id
            status
            sortOrder
            team {
              id
            }
            ...DraggableProject_project
          }
        }
      }
    }
  `
);
