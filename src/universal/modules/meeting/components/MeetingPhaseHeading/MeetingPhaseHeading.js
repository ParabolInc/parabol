import React, {PropTypes} from 'react';
import Type from 'universal/components/Type/Type';

const MeetingSectionHeading = (props) =>
  <Type align="center" bold family="serif" scale="s7" theme="warm">
    {props.children}
  </Type>;

MeetingSectionHeading.propTypes = {
  children: PropTypes.any
};

export default MeetingSectionHeading;
