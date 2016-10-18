import React, {PropTypes} from 'react';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import MeetingSummary from 'universal/modules/summary/components/MeetingSummary/MeetingSummary';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';

const meetingSummaryQuery = `
query{
  meeting: getMeetingById(id: $id) {
    id
    teamId
    teamName
    meetingNumber
    agendaItemsCompleted
    teamMembers {
      id
      picture
      preferredName
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
    enhancedTeamMembers[i] = {...teamMember, actions: [], projects: []};
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
    sort: {
      teamMembers: (a, b) => a.preferredName > b.preferredName ? 1 : -1
    },
  }).data;
  const {
    agendaItemsCompleted,
    meetingNumber,
    teamId,
    teamMembers,
    teamName,
    actions,
    projects
  } = meeting;
  const enhancedTeamMembers = groupOutcomesByTeamMember(actions, projects, teamMembers);
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

const MeetingSummaryContainer = (props) => {
  return <MeetingSummary {...props} />;
};

MeetingSummaryContainer.propTypes = {
  actionCount: PropTypes.number,
  agendaItemsCompleted: PropTypes.number,
  meetingNumber: PropTypes.number,
  projectCount: PropTypes.number,
  teamId: PropTypes.string,
  teamMembers: PropTypes.array,
  teamName: PropTypes.string
};

export default requireAuth(
  connect(mapStateToProps)(MeetingSummaryContainer)
);
