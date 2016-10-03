import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import PushButton from 'universal/components/PushButton/PushButton';
import withHotkey from 'react-hotkey-hoc';
import voidClick from 'universal/utils/voidClick';

const CheckInCardButtons = (props) => {
  const {bindHotkey, checkInPressFactory, isCheckedIn, styles} = props;
  const handleOnClickPresent = isCheckedIn ? voidClick : checkInPressFactory(true);
  const handleOnClickAbsent = isCheckedIn !== false ? checkInPressFactory(false) : voidClick;
  bindHotkey('c', handleOnClickPresent);
  bindHotkey('x', handleOnClickAbsent);
  return (
    <div className={css(styles.buttonsBlock)}>
      <PushButton
        handleOnClick={handleOnClickPresent}
        isPressed={isCheckedIn === true}
        keystroke="c"
        label="ok, let’s do this!"
        size="large"
      />
      <PushButton
        handleOnClick={handleOnClickAbsent}
        isPressed={isCheckedIn === false}
        keystroke="x"
        label="can’t make this one"
        size="large"
      />
    </div>
  );
};

CheckInCardButtons.propTypes = {
  bindHotkey: PropTypes.func,
  checkInPressFactory: PropTypes.func.isRequired,
  isCheckedIn: PropTypes.bool,
  styles: PropTypes.object
};

const styleThunk = () => ({
  buttonsBlock: {
    display: 'inline-block',
    textAlign: 'left'
  }
});

export default withStyles(styleThunk)(withHotkey(CheckInCardButtons));
