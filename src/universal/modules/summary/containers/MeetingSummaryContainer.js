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
  return {
    meeting
  };
};

const MeetingSummaryContainer = (props) => {
  const {meeting} = props;
  return <MeetingSummary meeting={meeting}/>
};

export default connect(mapStateToProps)(MeetingSummaryContainer);
