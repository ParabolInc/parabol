import React, {Component} from 'react';
import {reduxForm, Field} from 'redux-form';
import PropTypes from 'prop-types';

import appTheme from 'universal/styles/theme/appTheme';

import Editable from 'universal/components/Editable/Editable';
import Button from 'universal/components/Button/Button';
import Tooltip from 'universal/components/Tooltip/Tooltip';


class StaticCheckinQuestion extends Component {
  propTypes = {
    checkInQuestion: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    this.upSellTimeout = null;
  }

  state = {
    upSelling: false
  };

  componentWillUnmount() {
    this.clearupSellTimeout();
  }

  clearupSellTimeout = () => {
    if (this.upSellTimeout) {
      clearTimeout(this.upSellTimeout);
    }
  };

  upSell = (event) => {
    event.preventDefault();
    this.clearupSellTimeout();
    this.upSellTimeout = setTimeout(() => {
      this.setState({upSelling: false});
    }, 4000);
    this.setState({upSelling: true});
  };

  render() {
    const {checkInQuestion} = this.props;
    const {upSelling} = this.state;
    const upgradeCopy = 'Upgrade to a Pro Account to customize the Social Check-in question.';
    return (
      <Tooltip
        isOpen={upSelling}
        tip={<div>{upgradeCopy}</div>}
        originAnchor={{vertical: 'bottom', horizontal: 'center'}}
        targetAnchor={{vertical: 'top', horizontal: 'center'}}
      >
        <span>
          {checkInQuestion}
          <Button
            aria-label={upgradeCopy}
            title={upgradeCopy}
            compact
            size="small"
            disabled={upSelling}
            buttonStyle="flat"
            icon="pencil"
            onClick={this.upSell}
          />
        </span>
      </Tooltip>
    );
  }
}


const formName = 'checkInQuestion';

let EditCheckinQuestion = ({checkInQuestion, handleSubmit}) => {
  const example = 'e.g. How are you today?';
  const debugHandleSubmit = (event) => {
    event.preventDefault();
    console.log('submitted checkin question!');
  };
  const fieldStyles = {
    fontSize: '1.25rem',
    lineHeight: 1.5,
    placeholderColor: appTheme.palette.mid70l
  };
  return (
    <Field
      component={Editable}
      initialValue={checkInQuestion}
      name={formName}
      placeholder={example}
      submitOnBlur
      typeStyles={fieldStyles}
      handleSubmit={debugHandleSubmit}
    />
  );
};

EditCheckinQuestion.propTypes = {
  checkInQuestion: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired
};

EditCheckinQuestion = reduxForm({form: formName, enableReinitialize: true})(EditCheckinQuestion);


const CheckInQuestion = ({canEdit, checkInQuestion}) => {
  const formattedCheckInQuestion = `${checkInQuestion}?`;
  return canEdit
    ? <EditCheckinQuestion checkInQuestion={formattedCheckInQuestion} />
    : <StaticCheckinQuestion checkInQuestion={formattedCheckInQuestion} />;
};

CheckInQuestion.propTypes = {
  checkInQuestion: PropTypes.string.isRequired,
  canEdit: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func
};

export default CheckInQuestion;
