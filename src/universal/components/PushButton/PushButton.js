import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';

const PushButton = (props) => {
  const {
    disabled,
    handleOnClick,
    isPressed,
    keystroke,
    label,
    size,
    styles
  } = props;

  const buttonStyles = css(
    styles.button,
    isPressed && styles.isPressed,
    size === 'large' && styles.buttonLarge
  );

  return (
    <div className={css(styles.block)} onClick={!isPressed && handleOnClick}>
      <button
        disabled={disabled}
        className={buttonStyles}
      >
        {keystroke}
      </button>
      <div className={css(styles.label)}>
        {label}
      </div>
    </div>
  );
};

PushButton.propTypes = {
  disabled: PropTypes.bool,
  handleOnClick: PropTypes.func,
  isInverted: PropTypes.bool,
  isPressed: PropTypes.bool,
  keystroke: PropTypes.any,
  label: PropTypes.any,
  size: PropTypes.oneOf([
    'default',
    'large'
  ]),
  styles: PropTypes.object
};

PushButton.defaultProps = {
  size: 'default'
};

const styleThunk = () => ({
  pushButtonGroup: {
    textAlign: 'left'
  },

  block: {
    cursor: 'pointer',
    display: 'block',
    marginBottom: '.5rem',

    ':hover': {
      opacity: '.65'
    }
  },

  button: {
    backgroundColor: '#f0f1f4',
    border: 0,
    borderBottom: '2px solid #c3c5d1',
    borderRadius: '.25rem',
    color: appTheme.palette.warm,
    cursor: 'pointer',
    display: 'inline-block',
    fontFamily: appTheme.typography.monospace,
    fontSize: appTheme.typography.s3,
    fontWeight: 700,
    lineHeight: 1,
    marginRight: '.25rem',
    minWidth: '2rem',
    padding: '.25rem',
    textAlign: 'center',
    textShadow: '0 1px 0 #fff',
    verticalAlign: 'middle'
  },

  isPressed: {
    backgroundColor: '#dcdbdf',
    borderBottom: '0',
    borderTop: '2px solid #a4a7b9',
    outline: 'none'
  },

  buttonLarge: {
    fontSize: appTheme.typography.s4,
    minWidth: '2.5rem',
    padding: '.375rem'
  },

  label: {
    display: 'inline-block',
    fontFamily: appTheme.typography.serif,
    fontSize: appTheme.typography.s3,
    fontStyle: 'italic',
    fontWeight: 400,
    verticalAlign: 'middle'
  }
});

export default withStyles(styleThunk)(PushButton);
