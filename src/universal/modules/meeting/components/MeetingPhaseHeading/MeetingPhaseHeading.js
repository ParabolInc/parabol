import React, {PropTypes} from 'react';
import {Type} from 'universal/components';

const MeetingPhaseHeading = (props) =>
  <Type align="center" bold family="serif" scale="s7" theme="warm">
    {props.children}
  </Type>;

MeetingPhaseHeading.propTypes = {
  children: PropTypes.any
};

export default MeetingPhaseHeading;
