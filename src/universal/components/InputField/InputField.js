import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import appTheme from 'universal/styles/theme/appTheme';
import IconButton from 'universal/components/IconButton/IconButton';

const InputField = (props) => {
  const {
    autoFocus,
    hasErrorText,
    hasHelpText,
    helpText,
    input,
    isWider,
    theme: inputTheme,
    buttonDisabled,
    buttonIcon,
    hasButton,
    hasShortcutHint,
    isLarger,
    onButtonClick,
    placeholder,
    shortcutHint,
    styles,
  } = props;

  const styleTheme = inputTheme || 'cool';

  const shortcutHintStyles = css(
    styles.shortcutHint,
    buttonDisabled && styles.shortcutHintDisabled
  );

  const helpTextStyles = css(
    styles.helpText,
    hasErrorText && styles.helpTextError
  );

  const inputStyles = css(
    // allow hotkeys to be triggered when inside a field input
    styles.field,
    styles[styleTheme],
    isLarger && styles.fieldLarger,
    isWider && styles.fieldWider
  );

  return (
    <div className={css(styles.fieldBlock)}>
      <input
        {...input}
        autoFocus={autoFocus}
        className={`${inputStyles} mousetrap`}
        placeholder={placeholder}
      />
      {hasButton &&
        <div className={css(styles.buttonBlock)}>
          <IconButton
            disabled={buttonDisabled}
            iconName={buttonIcon}
            iconSize="2x"
            onClick={onButtonClick}
          />
        </div>
      }
      {hasHelpText && <div className={helpTextStyles}>{helpText}</div>}
      {hasShortcutHint && <div className={shortcutHintStyles}>{shortcutHint}</div>}
    </div>
  );
};

InputField.propTypes = {
  name: PropTypes.string,
  hasErrorText: PropTypes.bool,
  hasHelpText: PropTypes.bool,
  helpText: PropTypes.object,
  input: PropTypes.shape({
    autoFocus: PropTypes.bool,
    buttonDisabled: PropTypes.bool,
    buttonIcon: PropTypes.string,
    hasButton: PropTypes.bool,
    hasShortcutHint: PropTypes.bool,
    isLarger: PropTypes.bool,
    name: PropTypes.string,
    onBlur: PropTypes.func,
    onButtonClick: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    placeholder: PropTypes.string,
    shortcutHint: PropTypes.string,
    type: PropTypes.string,
    value: PropTypes.string
  }),
  isWider: PropTypes.bool,
  theme: PropTypes.oneOf([
    'cool',
    'warm'
  ])
};

const fieldLightGray = appTheme.palette.dark50l;

const styleThunk = () => ({
  fieldBlock: {
    margin: '0 auto',
    maxWidth: '100%',
    minWidth: '20rem',
    position: 'relative'
  },

  field: {
    border: 0,
    borderBottom: `1px dashed ${fieldLightGray}`,
    boxShadow: 'none',
    fontSize: appTheme.typography.s4,
    fontWeight: 700,
    lineHeight: 1.5,
    margin: '0 0 .5rem',
    padding: '.125rem .5rem',
    width: '100%',

    '::placeholder': {
      color: fieldLightGray
    },

    // NOTE: :focus, :active have same styles
    ':focus': {
      borderStyle: 'solid',
      outline: 'none'
    },
    ':active': {
      borderStyle: 'solid',
      outline: 'none'
    }
  },

  cool: {
    '::selection': {
      backgroundColor: appTheme.palette.cool10l
    },

    // NOTE: :focus, :active have same styles
    ':focus': {
      borderColor: appTheme.palette.cool50l,
      color: appTheme.palette.cool,
    },
    ':active': {
      borderColor: appTheme.palette.cool50l,
      color: appTheme.palette.cool,
    }
  },

  warm: {
    '::selection': {
      backgroundColor: appTheme.palette.warm10l
    },

    // NOTE: :focus, :active have same styles
    ':focus': {
      borderColor: appTheme.palette.warm50l,
      color: appTheme.palette.warm,
    },
    ':active': {
      borderColor: appTheme.palette.warm50l,
      color: appTheme.palette.warm,
    }
  },

  // NOTE: Modifies field
  fieldLarger: {
    borderBottomWidth: '2px',
    fontSize: appTheme.typography.s6,
    fontWeight: 400
  },

  // NOTE: Modifies field
  fieldWider: {
    minWidth: '30rem'
  },

  buttonBlock: {
    left: '100%',
    padding: '0 0 0 1rem',
    position: 'absolute',
    top: '.375rem'
  },

  helpText: {
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s3,
    fontStyle: 'italic',
    fontWeight: 700
  },

  // NOTE: Modifies helpText
  helpTextError: {
    color: appTheme.palette.warm
  },

  shortcutHint: {
    color: appTheme.palette.warm,
    fontSize: appTheme.typography.s3,
    fontStyle: 'italic',
    fontWeight: 700,
    textAlign: 'right'
  },

  // NOTE: Modifies shortcutHint
  shortcutHintDisabled: {
    opacity: '.5'
  }
});

export default withStyles(styleThunk)(InputField);
