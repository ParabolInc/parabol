import PropTypes from 'prop-types';
import React from 'react';

const HelpTextMyRound = ({updateUserHasTasks}) => {
  const helpText = updateUserHasTasks
    ? 'Quick updates only, please.'
    : 'Add cards to track your current work.';
  return <span>{`(Your turn to share. ${helpText})`}</span>;
};

HelpTextMyRound.propTypes = {
  updateUserHasTasks: PropTypes.bool
};

export default HelpTextMyRound;
