import React, {Component} from 'react';
import {reduxForm, Field} from 'redux-form';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import {css} from 'aphrodite-local-styles/no-important';

import appTheme from 'universal/styles/theme/appTheme';
import withStyles from 'universal/styles/withStyles';
import ui from 'universal/styles/ui';

import Editable from 'universal/components/Editable/Editable';
import Tooltip from 'universal/components/Tooltip/Tooltip';

@withStyles(() => ({
  fakeEditable: {
    fontFamily: appTheme.typography.serif,
    color: appTheme.palette.dark,
    ':hover, :focus': {
      cursor: 'pointer',
      opacity: 0.5,
      outline: 'none'
    }
  }
}))
class StaticCheckinQuestion extends Component {
  static propTypes = {
    checkInQuestion: PropTypes.string.isRequired,
    styles: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.upSellTimeout = null;
  }

  state = {
    hovering: false,
    upSelling: false
  };

  hoverOn = () => {
    this.setState({hovering: true});
  };

  hoverOff = () => {
    this.setState({hovering: false});
  };

  showUpsell = () => {
    this.setState({upSelling: true});
  };

  hideUpsell = () => {
    this.setState({upSelling: false});
  };

  render() {
    const {checkInQuestion, styles} = this.props;
    const {hovering, upSelling} = this.state;
    const upgradeCopy = 'Upgrade to a Pro Account to customize the Social Check-in question.';
    const iconStyle = {
      fontSize: ui.buttonIconSize.small,
      verticalAlign: 'middle'
    };
    return (
      <Tooltip
        isOpen={upSelling || hovering}
        tip={<div>{upgradeCopy}</div>}
        originAnchor={{vertical: 'bottom', horizontal: 'center'}}
        targetAnchor={{vertical: 'top', horizontal: 'center'}}
      >
        <span
          aria-label={upgradeCopy}
          title={upgradeCopy}
          role="button"
          tabIndex="0"
          className={css(styles.fakeEditable)}
          onMouseOver={this.hoverOn}
          onMouseOut={this.hoverOff}
          onFocus={this.showUpsell}
          onBlur={this.hideUpsell}
        >
          {checkInQuestion}{' '}
          <FontAwesome name="pencil" style={iconStyle} />
        </span>
      </Tooltip>
    );
  }
}


const formName = 'checkInQuestion';

let EditCheckinQuestion = ({checkInQuestion, handleSubmit, onSubmit}) => {
  const example = 'e.g. How are you today?';
  const fieldStyles = {
    color: appTheme.palette.dark,
    fontSize: '1.25rem',
    lineHeight: '1.5',
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
      handleSubmit={handleSubmit(onSubmit)}
    />
  );
};

EditCheckinQuestion.propTypes = {
  checkInQuestion: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired, // provided by reduxForm
  onSubmit: PropTypes.func.isRequired // provided by the parent component; function of (string) => any
};

const validate = ({checkInQuestion}) => {
  const errors = {checkInQuestion: null};
  if (!checkInQuestion || !checkInQuestion.trim()) {
    errors.checkInQuestion = 'Must provide Check-in question.';
  }
  return errors;
};

EditCheckinQuestion = reduxForm({
  form: formName,
  enableReinitialize: true,
  validate
})(EditCheckinQuestion);


const CheckInQuestion = ({canEdit, checkInQuestion, onSubmit}) => {
  const formattedCheckInQuestion = `${checkInQuestion}?`;
  return canEdit
    ? <EditCheckinQuestion checkInQuestion={formattedCheckInQuestion} onSubmit={onSubmit} />
    : <StaticCheckinQuestion checkInQuestion={formattedCheckInQuestion} />;
};

CheckInQuestion.propTypes = {
  checkInQuestion: PropTypes.string.isRequired,
  canEdit: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func
};

export default CheckInQuestion;
