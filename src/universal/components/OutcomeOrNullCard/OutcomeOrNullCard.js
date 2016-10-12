import React, {PropTypes} from 'react';
import OutcomeCardContainer from 'universal/modules/outcomeCard/containers/OutcomeCard/OutcomeCardContainer';
import NullCard from 'universal/components/NullCard/NullCard';

const OutcomeOrNullCard = (props) => {
  const {myUserId, outcome} = props;
  const {content, createdBy, teamMember: {preferredName}, type} = outcome;
  const showOutcome = content || createdBy === myUserId;
  return showOutcome ? <OutcomeCardContainer {...props}/> :
    <NullCard preferredName={preferredName} type={type || 'Project'}/>;
};


OutcomeOrNullCard.propTypes = {
  myUserId: PropTypes.string,
  outcome: PropTypes.object
};

export default OutcomeOrNullCard;
