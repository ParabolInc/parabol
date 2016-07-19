import React, {PropTypes} from 'react';
import Type from 'universal/components/Type/Type';

const MeetingSectionSubheading = (props) =>
  <Type align="center" italic marginTop=".5rem" scale="s3">
    {props.children}
  </Type>;

MeetingSectionSubheading.propTypes = {
  children: PropTypes.any
};

export default MeetingSectionSubheading;
