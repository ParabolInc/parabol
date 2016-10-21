import React, {Component, PropTypes} from 'react';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import MeetingSummary from 'universal/modules/summary/components/MeetingSummary/MeetingSummary';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';

const meetingSummaryQuery = `
query{
  meeting: getMeetingById(id: $id) @cached(type: "Meeting") {
    id
    teamId
    teamName
    meetingNumber
    agendaItemsCompleted
    invitees {
      id
      present
      membership {
        id
        picture
        preferredName  
      }
    }
    actions {
      id
      content
      teamMemberId
    }
    projects {
      id
      content
      status
      teamMemberId
    }
  }
}`;

const objectifyTeamMembers = (teamMembers) => {
  const enhancedTeamMembers = [];
  const teamMemberIndices = {};
  for (let i = 0; i < teamMembers.length; i++) {
    const teamMember = teamMembers[i];
    enhancedTeamMembers[i] = {
      id: teamMember.id,
      present: teamMember.present,
      picture: teamMember.membership.picture,
      preferredName: teamMember.membership.preferredName,
      actions: [],
      projects: []
    };
    teamMemberIndices[teamMember.id] = i;
  }
  return {enhancedTeamMembers, teamMemberIndices};
};

const groupOutcomesByTeamMember = (actions, projects, teamMembers) => {
  const {enhancedTeamMembers, teamMemberIndices} = objectifyTeamMembers(teamMembers);
  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    const idx = teamMemberIndices[action.teamMemberId];
    enhancedTeamMembers[idx].actions.push(action);
  }
  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    const idx = teamMemberIndices[project.teamMemberId];
    enhancedTeamMembers[idx].projects.push(project);
  }
  return enhancedTeamMembers;
};

const mapStateToProps = (state, props) => {
  const {params: {meetingId}} = props;
  const {meeting} = cashay.query(meetingSummaryQuery, {
    op: 'meetingSummaryContainer',
    key: meetingId,
    variables: {id: meetingId},
    resolveCached: {
      meeting: () => meetingId
    },
    sort: {
      invitees: (a, b) => a.preferredName > b.preferredName ? 1 : -1
    },
  }).data;
  const {
    agendaItemsCompleted,
    meetingNumber,
    teamId,
    invitees,
    teamName,
    actions,
    projects
  } = meeting;
  const enhancedTeamMembers = groupOutcomesByTeamMember(actions, projects, invitees);
  return {
    actionCount: actions.length,
    agendaItemsCompleted,
    meetingNumber,
    projectCount: projects.length,
    teamId,
    teamMembers: enhancedTeamMembers,
    teamName,
  };
};

@requireAuth
@connect(mapStateToProps)
export default class MeetingSummaryContainer extends Component {
  static propTypes = {
    actionCount: PropTypes.number,
    agendaItemsCompleted: PropTypes.number,
    meetingNumber: PropTypes.number,
    projectCount: PropTypes.number,
    teamId: PropTypes.string,
    teamMembers: PropTypes.array,
    teamName: PropTypes.string
  };

  componentWillMount() {
    const {params: {meetingId}} = this.props;
    const variables = {meetingId};
    cashay.mutate('summarizeMeeting', {variables})
  }

  render() {
    return <MeetingSummary {...props} />;
  }
};
