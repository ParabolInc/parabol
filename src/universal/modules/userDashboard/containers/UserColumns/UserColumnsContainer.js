import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {createFragmentContainer} from 'react-relay';
import ProjectColumns from 'universal/components/ProjectColumns/ProjectColumns';
import {USER_DASH} from 'universal/utils/constants';
import makeProjectsByStatus from 'universal/utils/makeProjectsByStatus';

const mapStateToProps = (state) => {
  const {teamFilterId} = state.userDashboard;
  const queryKey = teamFilterId || '';
  return {
    queryKey,
    userId: state.auth.obj.sub
  };
};

class UserColumnsContainer extends Component {
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
    const {queryKey, teams, userId} = this.props;
    const {projects} = this.state;
    return (
      <ProjectColumns
        queryKey={queryKey}
        projects={projects}
        area={USER_DASH}
        teams={teams}
        userId={userId}
      />
    );
  }
}

UserColumnsContainer.propTypes = {
  projects: PropTypes.object,
  queryKey: PropTypes.string,
  teams: PropTypes.array,
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
            id
            content
            createdAt
            createdBy
            integration {
              service
              nameWithOwner
              issueNumber
            }
            sortOrder
            status
            tags
            teamMemberId
            updatedAt
            userId
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
    }
  `
);
