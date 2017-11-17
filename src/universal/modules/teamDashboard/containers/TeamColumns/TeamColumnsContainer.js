import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {createFragmentContainer} from 'react-relay';
import ProjectColumns from 'universal/components/ProjectColumns/ProjectColumns';
import {TEAM_DASH} from 'universal/utils/constants';

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
    this.filterByTeamMember(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const {teamMemberFilterId: oldFilter, viewer: {projects: oldProjects}} = this.props;
    const {teamMemberFilterId, viewer: {projects}} = nextProps;
    if (oldFilter !== teamMemberFilterId || oldProjects !== projects) {
      this.filterByTeamMember(nextProps);
    }
  }

  filterByTeamMember(props) {
    const {teamMemberFilterId, viewer: {projects}} = props;
    const edges = teamMemberFilterId ?
      projects.edges.filter(({node}) => node.teamMember.id === teamMemberFilterId) :
      projects.edges;
    this.setState({
      projects: {
        ...projects,
        edges
      }
    });
  }

  render() {
    const {myTeamMemberId, teamMemberFilterId} = this.props;
    const {projects} = this.state;
    return (
      <ProjectColumns
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
