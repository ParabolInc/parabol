import PropTypes from 'prop-types';
import React from 'react';
import {Type} from 'universal/components';

const MeetingPhaseHeading = (props) => {
  const {align, children} = props;
  return (
    <Type align={align} bold family="serif" scale="s7" colorPalette="dark">
      {children}
    </Type>
  );
};


MeetingPhaseHeading.propTypes = {
  align: PropTypes.oneOf([
    'left',
    'center',
    'right'
  ]),
  children: PropTypes.any
};

MeetingPhaseHeading.defaultProps = {
  align: 'left'
};

export default MeetingPhaseHeading;
