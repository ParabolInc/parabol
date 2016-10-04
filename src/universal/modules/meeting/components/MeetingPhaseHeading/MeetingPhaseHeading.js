import React, {PropTypes} from 'react';
import {Type} from 'universal/components';

const MeetingPhaseHeading = (props) => {
  const {children} = props;
  return (
    <Type align="center" bold family="serif" scale="s7" colorPalette="warm">
      {children}
    </Type>
  );
};


MeetingPhaseHeading.propTypes = {
  children: PropTypes.any
};

export default MeetingPhaseHeading;
