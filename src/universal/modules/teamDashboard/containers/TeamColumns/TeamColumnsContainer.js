import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {createFragmentContainer} from 'react-relay';
import ProjectColumns from 'universal/components/ProjectColumns/ProjectColumns';
import {TEAM_DASH} from 'universal/utils/constants';
import makeProjectsByStatus from 'universal/utils/makeProjectsByStatus';

const mapStateToProps = (state, props) => {
  const {teamId} = props;
  const {teamMemberFilterId} = state.teamDashboard;
  const key = teamMemberFilterId || teamId;
  const userId = state.auth.obj.sub;
  return {
    myTeamMemberId: `${userId}::${teamId}`,
    queryKey: key,
    userId
  };
};


class TeamColumnsContainer extends Component {
  state = {};

  componentWillMount() {
    const {viewer: {projects}} = this.props;
    this.groupProjectsByStatus(projects);
  }

  componentWillReceiveProps(nextProps) {
    const {viewer: {projects}} = nextProps;
    const {viewer: {projects: oldProjects}} = this.props;
    if (projects !== oldProjects) {
      this.groupProjectsByStatus(projects);
    }
  }

  groupProjectsByStatus(projects) {
    const nodes = projects.edges.map(({node}) => node);
    this.setState({
      projects: makeProjectsByStatus(nodes)
    });
  }

  render() {
    const {myTeamMemberId, queryKey, userId} = this.props;
    const {projects} = this.state;
    return (
      <ProjectColumns
        myTeamMemberId={myTeamMemberId}
        projects={projects}
        queryKey={queryKey}
        area={TEAM_DASH}
        userId={userId}
      />
    );
  }
}

TeamColumnsContainer.propTypes = {
  myTeamMemberId: PropTypes.string,
  queryKey: PropTypes.string.isRequired,
  teamId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired
};

export default createFragmentContainer(
  connect(mapStateToProps)(TeamColumnsContainer),
  graphql`
    fragment TeamColumnsContainer_viewer on User {
      projects(teamId: $teamId) {
        edges {
          node {
            id
            content
            createdAt
            createdBy
            integration {
              service
              nameWithOwner
              issueNumber
            }
            status
            tags
            teamMemberId
            updatedAt
            sortOrder
            updatedAt
            team {
              id
              name
            }
            teamMember {
              id
              picture
              preferredName
            }
          }
        }
      }
    }`
);
