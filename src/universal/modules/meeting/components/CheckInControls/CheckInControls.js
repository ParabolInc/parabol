import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import FontAwesome from 'react-fontawesome';
import withHotkey from 'react-hotkey-hoc';
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting';

const CheckInControls = (props) => {
  const {
    bindHotkey,
    checkInPressFactory,
    nextMemberName,
    styles
  } = props;

  const handleOnClickPresent = checkInPressFactory(true);
  const handleOnClickAbsent = checkInPressFactory(false);

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
    fontSize: ui.iconSize2x
  };

  const nextPhaseName = actionMeeting.updates.name;

  bindHotkey('h', handleOnClickPresent);
  bindHotkey('n', handleOnClickAbsent);

  return (
    <div className={css(styles.controlBlock)}>
      <div className={css(styles.control, styles.nextControl)} onClick={handleOnClickPresent}>
        <FontAwesome name="check-circle" style={nextIcon} />
        <span className={css(styles.label)}>
          <u>{'H'}</u>{'ere – '}{nextMemberName ? `move to ${nextMemberName}` : `move to ${nextPhaseName}`}
        </span>
      </div>
      <div className={css(styles.control, styles.skipControl)} onClick={handleOnClickAbsent}>
        <FontAwesome name="minus-circle" style={skipIcon} />
        <span className={css(styles.label)}>
          <u>{'N'}</u>{'ot here – '}{nextMemberName ? `skip to ${nextMemberName}` : `skip to ${nextPhaseName}`}
        </span>
      </div>
    </div>
  );
};

CheckInControls.propTypes = {
  bindHotkey: PropTypes.func.isRequired,
  checkInPressFactory: PropTypes.func.isRequired,
  nextMemberName: PropTypes.string,
  styles: PropTypes.object
};

const styleThunk = () => ({
  control: {
    cursor: 'pointer',
    display: 'block',
    fontSize: appTheme.typography.s5,
    lineHeight: '1.5'
  },

  nextControl: {
    color: appTheme.palette.cool,
    marginBottom: '.5rem'
  },

  skipControl: {
    color: appTheme.palette.warm
  },

  controlBlock: {
    display: 'inline-block',
    paddingTop: '1rem',
    textAlign: 'left'
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

export default withStyles(styleThunk)(withHotkey(CheckInControls));
