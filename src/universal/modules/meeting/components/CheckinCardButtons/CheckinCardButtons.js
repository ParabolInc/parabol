import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import FontAwesome from 'react-fontawesome';
import withHotkey from 'react-hotkey-hoc';

const CheckinCardButtons = (props) => {
  const {
    bindHotkey,
    checkInPressFactory,
    member,
    styles
  } = props;

  const handleOnClickPresent = checkInPressFactory(true);
  const handleOnClickAbsent = checkInPressFactory(false);
  const name = member.preferredName;
  const icon = {
    display: 'inline-block',
    lineHeight: 'inherit',
    textAlign: 'right',
    verticalAlign: 'middle',
    width: '2rem'
  };
  const nextIcon = {
    ...icon,
    fontSize: ui.iconSize2x
  };
  const skipIcon = {
    ...icon,
    fontSize: ui.iconSize
  };

  bindHotkey('n', handleOnClickPresent);
  bindHotkey('s', handleOnClickAbsent);

  return (
    <div className={css(styles.controlBlock)}>

      <div className={css(styles.control, styles.nextControl)} onClick={handleOnClickPresent}>
        <FontAwesome name="check-circle" style={nextIcon} />
        <span className={css(styles.label)}><u>N</u>ext ({name} checked in)</span>
      </div>

      <div className={css(styles.control, styles.skipControl)} onClick={handleOnClickAbsent}>
        <FontAwesome name="minus-circle" style={skipIcon} />
        <span className={css(styles.label)}><u>S</u>kip ({name}’s not here)</span>
      </div>
    </div>
  );
};

CheckinCardButtons.propTypes = {
  bindHotkey: PropTypes.func,
  checkInPressFactory: PropTypes.func.isRequired,
  member: PropTypes.object,
  styles: PropTypes.object
};

const styleThunk = () => ({
  control: {
    cursor: 'pointer',
    display: 'block',
    lineHeight: '1.5'
  },

  nextControl: {
    color: appTheme.palette.cool,
    fontSize: appTheme.typography.s6,
    marginBottom: '.5rem',
  },

  skipControl: {
    color: appTheme.palette.warm,
    fontSize: appTheme.typography.s3,
  },

  controlBlock: {
    display: 'inline-block',
    paddingTop: '1rem',
    textAlign: 'center'
  },

  label: {
    display: 'inline-block',
    paddingLeft: '.5rem',
    verticalAlign: 'middle',

    ':hover': {
      textDecoration: 'underline'
    },
    ':focus': {
      textDecoration: 'underline'
    }
  }
});

export default withStyles(styleThunk)(withHotkey(CheckinCardButtons));
