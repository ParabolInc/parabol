import React, {PropTypes} from 'react';
import {cashay} from 'cashay';
import {connect} from 'react-redux';

const meetingSummaryQuery = `
query{
  team: getTeamById(teamId: $teamId) {
    id
    name
    teamMembers {
      id
      picture
      preferredName
      
    }
  }
}`;

const mapStateToProps = (state, props) => {
  const {params: {teamId}} = props;
  const {team} = cashay.query(meetingSummaryQuery, {
    op: 'meetingSummaryContainer',
    key: teamId,
    variables: {teamId},
    sort: {
      teamMembers: (a, b) => a.preferredName > b.preferredName ? 1 : -1
    },
  }).data;
  return {
    team
  };
};

const MeetingSummaryContainer = (props) => {
  const {team} = props;
  return <MeetingSummary team={team}/>
};

export default connect(mapStateToProps)(MeetingSummaryContainer);
