import React, {Component} from 'react';
// import {reduxForm, Field} from 'redux-form';
import PropTypes from 'prop-types';

// import Editable from 'universal/components/Editable/Editable';
// import MeetingPrompt from 'universal/modules/meeting/components/MeetingPrompt/MeetingPrompt';

const StaticCheckinQuestion = ({checkInQuestion}) => (
  <span>{checkInQuestion}?</span>
);

StaticCheckinQuestion.propTypes = {
  checkInQuestion: PropTypes.string.isRequired
};

const CheckInQuestion = ({canEdit, checkInQuestion}) => (
  canEdit
    ? <StaticCheckinQuestion {...{checkInQuestion}} />
    : <StaticCheckinQuestion {...{checkInQuestion}} />
);

CheckInQuestion.propTypes = {
  checkInQuestion: PropTypes.string.isRequired,
  canEdit: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func
};

export default CheckInQuestion;
