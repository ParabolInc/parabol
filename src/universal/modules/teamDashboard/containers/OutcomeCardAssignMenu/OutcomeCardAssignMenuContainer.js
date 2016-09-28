import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import OutcomeCardAssignMenu from 'universal/components/OutcomeCard/OutcomeCardAssignMenu';

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
  const {id: outcomeId} = props.outcome;
  const [teamId] = outcomeId.split('::');
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
  const {onComplete, outcome, teamMembers} = props;
  return (
    <OutcomeCardAssignMenu
      onComplete={onComplete}
      outcome={outcome}
      teamMembers={teamMembers}
    />
  );
};

OutcomeCardAssignMenuContainer.propTypes = {
  onComplete: PropTypes.func,
  outcome: PropTypes.object,
  teamMembers: PropTypes.array
};

export default connect(mapStateToProps)(OutcomeCardAssignMenuContainer);
