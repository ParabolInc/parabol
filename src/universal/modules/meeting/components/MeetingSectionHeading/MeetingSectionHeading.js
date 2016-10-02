import React, {PropTypes} from 'react';
import Type from 'universal/components/Type/Type';

const MeetingSectionHeading = (props) => {
  return (
    <Type align="center" bold family="serif" scale="s5">
      {props.children}
    </Type>
  );
};


MeetingSectionHeading.propTypes = {
  children: PropTypes.any
};

export default MeetingSectionHeading;
