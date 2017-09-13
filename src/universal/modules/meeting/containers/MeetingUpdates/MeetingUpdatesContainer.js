import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import makeProjectsByStatus from 'universal/utils/makeProjectsByStatus';
import MeetingUpdates from 'universal/modules/meeting/components/MeetingUpdates/MeetingUpdates';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import checkForProjects from 'universal/utils/checkForProjects';

const meetingUpdatesQuery = `
query {
  projects(teamMemberId: $teamMemberId) @live {
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
    team @cached(type: "Team") {
      id
      name
    }
    teamMember @cached(type: "TeamMember") {
      id
      picture
      preferredName
    }
  }
}
`;

const mutationHandlers = {
  updateProject(optimisticUpdates, queryResponse, currentResponse) {
    if (optimisticUpdates) {
      const {updatedProject} = optimisticUpdates;
      if (updatedProject && updatedProject.hasOwnProperty('sortOrder')) {
        const {id, sortOrder, status} = updatedProject;
        const {projects} = currentResponse;
        const fromProject = projects.find((project) => project.id === id);
        if (sortOrder !== undefined) {
          fromProject.sortOrder = sortOrder;
        }
        if (status) {
          fromProject.status = status;
        }
        // no need to sort since the resolveTeamProjects function will do that next
        return currentResponse;
      }
    }
    return undefined;
  }
};

const mapStateToProps = (state, props) => {
  const {members, localPhaseItem} = props;
  const currentTeamMember = members[localPhaseItem - 1];
  const teamMemberId = currentTeamMember && currentTeamMember.id;
  const memberProjects = cashay.query(meetingUpdatesQuery, {
    op: 'meetingUpdatesContainer',
    key: teamMemberId,
    mutationHandlers,
    variables: {teamMemberId},
    filter: {
      projects: (project) => !project.tags.includes('private')
    },
    resolveCached: {
      teamMember: (source) => source.teamMemberId,
      team: (source) => source.teamMemberId.split('::')[1]
    }
  }).data.projects;
  const projects = makeProjectsByStatus(memberProjects);
  return {
    projects,
    queryKey: teamMemberId
  };
};

@connect(mapStateToProps)
export default class MeetingUpdatesContainer extends Component {
  static propTypes = {
    gotoItem: PropTypes.func.isRequired,
    gotoNext: PropTypes.func.isRequired,
    showEmpty: PropTypes.bool,
    localPhaseItem: PropTypes.number.isRequired,
    members: PropTypes.array.isRequired,
    projects: PropTypes.object.isRequired,
    queryKey: PropTypes.string,
    team: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      hasWaited: false,
      showEmpty: false
    };
  }

  componentWillMount() {
    setTimeout(() => {this.setState({hasWaited: true})}, 1000);
  }

  componentWillReceiveProps() {
    if (this.state.hasWaited) {
      this.setState({showEmpty: !checkForProjects(this.props.projects)});
    }
  }

  render() {
    if (!this.props.projects) {
      return <LoadingView />;
    }
    return <MeetingUpdates {...this.props} showEmpty={this.state.showEmpty} />;
  }
}
