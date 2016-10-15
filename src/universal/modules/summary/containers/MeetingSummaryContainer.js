import React, {PropTypes} from 'react';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import MeetingSummary from 'universal/modules/summary/components/MeetingSummary/MeetingSummary';
const meetingSummaryQuery = `
query{
  meeting: getMeetingById(id: $id) {
    id
    name
    meetingNumber
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
  const teamMembersObj = {};
  for (let i = 0; i < teamMembers.length; i++) {
    const teamMember = teamMembers[i];
    teamMembersObj[teamMember.id] = {...teamMember, actions: [], projects: []};
  }
  return teamMembersObj;
};

const groupOutcomesByTeamMember = (actions, projects, teamMembers) => {
  const teamMembersObj = objectifyTeamMembers(teamMembers);
  let updatedProjectCount = 0;
  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    teamMembersObj[action.teamMemberId].actions.push(action);
  }
  for (let i = 0; i < projects.length; i++) {
    const {newVal, oldVal} = projects[i];
    if (!oldVal) {
      teamMembersObj[newVal.teamMemberId].projects.push(newVal);
    } else {
      updatedProjectCount++;
    }
  }
  return {
    teamMembersObj,
    updatedProjectCount
  };
};

const mapStateToProps = (state, props) => {
  const {params: {teamId}} = props;
  const {meeting} = cashay.query(meetingSummaryQuery, {
    op: 'meetingSummaryContainer',
    key: teamId,
    variables: {teamId},
    sort: {
      teamMembers: (a, b) => a.preferredName > b.preferredName ? 1 : -1
    },
  }).data;
  const {meetingNumber, teamMembers, actions, projects} = meeting;
  const {teamMembersObj, updatedProjectCount} = groupOutcomesByTeamMember(actions, projects, teamMembers);
  return {
    actionCount: actions.length,
    meetingNumber,
    newProjectCount: projects.length - updatedProjectCount,
    teamMembers: teamMembersObj,
    updatedProjectCount,
  };
};

const MeetingSummaryContainer = (props) => {
  return <MeetingSummary {...props} />
};

export default connect(mapStateToProps)(MeetingSummaryContainer);
