import React, {PropTypes} from 'react';
import CheckinCardButtons from 'universal/modules/meeting/components/CheckinCardButtons/CheckinCardButtons';
import {withRouter} from 'react-router';

const CheckinCard = (props) => {
  const {
    checkInPressFactory,
    isActive,
    member,
    nextMember
  } = props;
  return (
    <div>
      {isActive && <CheckinCardButtons checkInPressFactory={checkInPressFactory} member={member} nextMember={nextMember} />}
    </div>
  );
};

CheckinCard.propTypes = {
  checkInPressFactory: PropTypes.func,
  handleCardClick: PropTypes.func,
  isActive: PropTypes.bool,
  member: PropTypes.object,
  nextMember: PropTypes.object
};

export default withRouter(CheckinCard);
