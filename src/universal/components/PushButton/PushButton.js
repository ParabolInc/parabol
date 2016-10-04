import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite/no-important';
import appTheme from 'universal/styles/theme/appTheme';

const PushButton = (props) => {
  // TODO replace focus CSS with isPushed
  const {disabled, keystroke, label, handleOnClick, size, isPressed, styles} = props;
  const buttonStyles = css(
    styles.button,
    isPressed && styles.isPressed,
    size === 'large' && styles.buttonLarge
  );

  return (
    <div className={css(styles.block)}>
      <button disabled={disabled} className={buttonStyles} onClick={!isPressed && handleOnClick}>
        {keystroke}
      </button>
      <div className={css(styles.label)}>{label}</div>
    </div>
  );
};

PushButton.propTypes = {
  disabled: PropTypes.bool,
  handleOnClick: PropTypes.func,
  isPressed: PropTypes.bool,
  keystroke: PropTypes.string,
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
    display: 'block',
    marginBottom: '.5rem'
  },

  button: {
    backgroundColor: '#f0f1f4',
    border: 0,
    borderBottom: '2px solid #c3c5d1',
    borderRadius: '.25rem',
    color: appTheme.palette.warm,
    cursor: 'pointer',
    display: 'inline-block',
    fontSize: appTheme.typography.s3,
    fontWeight: 700,
    lineHeight: 1,
    marginRight: '.25rem',
    padding: '.25rem',
    textAlign: 'center',
    textShadow: '0 1px 0 #fff',
    verticalAlign: 'middle',
    width: '1.5rem',
  },
  isPressed: {
    backgroundColor: '#dcdbdf',
    borderBottom: '0',
    borderTop: '2px solid #a4a7b9',
    outline: 'none'
  },
  buttonLarge: {
    fontSize: appTheme.typography.s4,
    padding: '.375rem',
    width: '1.75rem'
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
