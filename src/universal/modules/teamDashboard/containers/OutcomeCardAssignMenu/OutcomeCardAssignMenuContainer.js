import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import OutcomeCardAssignMenu from 'universal/modules/teamDashboard/components/TeamProjectCard/OutcomeCardAssignMenu';

const outcomeCardAssignMenuQuery = `
query {
  teamMembers(teamId: $teamId) @live {
    id
    picture
    preferredName
  }  
}
`;

const mapStateToProps = (state, props) => {
  const {id: projectId} = props.project;
  const [teamId] = projectId.split('::');
  const {teamMembers} = cashay.query(outcomeCardAssignMenuQuery, {
    op: 'outcomeCardAssignMenuContainer',
    key: teamId,
    variables: {teamId}
  }).data;
  return {
    teamMembers
  };
};

const OutcomeCardAssignMenuContainer = (props) => {
  return (
    <OutcomeCardAssignMenu
      {...props}
    />
  );
};

export default connect(mapStateToProps)(OutcomeCardAssignMenuContainer);
