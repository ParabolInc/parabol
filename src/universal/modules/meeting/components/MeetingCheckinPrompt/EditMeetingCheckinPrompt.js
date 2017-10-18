import React, {Component} from 'react';
import {reduxForm, Field} from 'redux-form';
import PropTypes from 'prop-types';

import Editable from 'universal/components/Editable/Editable';
import MeetingPrompt from 'universal/modules/meeting/components/MeetingPrompt/MeetingPrompt';

const formName = 'checkInQuestion';

const MeetingCheckinPrompt = () => {};

MeetingCheckinPrompt.propTypes = {
  avatar: PropTypes.string.isRequired,
  checkInQuestion: PropTypes.string.isRequired,
  canEdit: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func
};

export default reduxForm({form: formName, enableReinitialize: true})(MeetingCheckinPrompt);
