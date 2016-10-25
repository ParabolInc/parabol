import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import PushButton from 'universal/components/PushButton/PushButton';
import withHotkey from 'react-hotkey-hoc';
import voidClick from 'universal/utils/voidClick';

const CheckinCardButtons = (props) => {
  const {bindHotkey, checkInPressFactory, isCheckedIn, styles} = props;

  const handleOnClickPresent = isCheckedIn ? voidClick : checkInPressFactory(true);
  const handleOnClickAbsent = isCheckedIn !== false ? checkInPressFactory(false) : voidClick;

  const presentLabel = () =>
    <div className={css(styles.buttonLabel)}>
      <span className={css(styles.preLabel)}>mark as</span>
      <span className={css(styles.label)}><u>p</u>resent</span>
    </div>;

  const notPresentLabel = () =>
    <div className={css(styles.buttonLabel)}>
      <span className={css(styles.preLabel)}>mark as</span>
      <span className={css(styles.label)}><u>n</u>ot present</span>
    </div>;

  bindHotkey('p', handleOnClickPresent);
  bindHotkey('n', handleOnClickAbsent);

  return (
    <div className={css(styles.buttonsBlock)}>
      <PushButton
        handleOnClick={handleOnClickPresent}
        isPressed={isCheckedIn === true}
        keystroke="p"
        label={presentLabel()}
        size="large"
      />
      <PushButton
        handleOnClick={handleOnClickAbsent}
        isPressed={isCheckedIn === false}
        keystroke="n"
        label={notPresentLabel()}
        size="large"
      />
    </div>
  );
};

CheckinCardButtons.propTypes = {
  bindHotkey: PropTypes.func,
  checkInPressFactory: PropTypes.func.isRequired,
  isCheckedIn: PropTypes.bool,
  styles: PropTypes.object
};

const styleThunk = () => ({
  buttonsBlock: {
    display: 'inline-block',
    textAlign: 'left'
  },

  buttonLabel: {
    color: appTheme.palette.dark,
    display: 'inline-block',
    paddingLeft: '.25rem',
    verticalAlign: 'middle'
  },

  preLabel: {
    display: 'inline-block',
    fontFamily: appTheme.typography.serif,
    fontSize: appTheme.typography.s2,
    fontStyle: 'italic',
    verticalAlign: 'baseline'
  },

  label: {
    display: 'inline-block',
    fontFamily: appTheme.typography.sansSerif,
    fontStyle: 'normal',
    fontWeight: 700,
    paddingLeft: '.25rem',
    textTransform: 'uppercase',
    verticalAlign: 'baseline'
  }
});

export default withStyles(styleThunk)(withHotkey(CheckinCardButtons));
