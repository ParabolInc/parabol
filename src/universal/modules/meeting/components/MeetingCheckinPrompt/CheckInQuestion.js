import React, {Component} from 'react';
// import {reduxForm, Field} from 'redux-form';
import PropTypes from 'prop-types';

// import Editable from 'universal/components/Editable/Editable';
// import MeetingPrompt from 'universal/modules/meeting/components/MeetingPrompt/MeetingPrompt';
import Button from 'universal/components/Button/Button';
import Tooltip from 'universal/components/Tooltip/Tooltip';

const StaticCheckinQuestion = ({checkInQuestion}) => {
  const upgradeCopy = 'Upgrade to a Pro Account to customize the Social Check-in question.';
  return (
    <Tooltip
      tip={<div>{upgradeCopy}</div>}
      originAnchor={{vertical: 'bottom', horizontal: 'center'}}
      targetAnchor={{vertical: 'top', horizontal: 'center'}}
    >
      <span>
        {checkInQuestion}?
        <Button
          aria-label={upgradeCopy}
          title={upgradeCopy}
          compact
          disabled
          buttonStyle="flat"
          icon="pencil"
        />
      </span>
    </Tooltip>
  );
};

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
