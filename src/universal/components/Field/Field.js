import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import {Field as ReduxFormField} from 'redux-form';
import appTheme from 'universal/styles/theme';
import IconButton from 'universal/components/IconButton/IconButton';

const combineStyles = StyleSheet.combineStyles;
const fieldLightGray = appTheme.palette.dark50l;

let styles = {};

/*
 * Why are we defining this here?
 * See: https://github.com/erikras/redux-form/releases/tag/v6.0.0-alpha.14
 */
const FieldBlock = props => {
  const {
    buttonDisabled,
    buttonIcon,
    hasButton,
    hasErrorText,
    hasHelpText,
    hasShortcutHint,
    helpText,
    isLarger,
    isWider,
    onButtonClick,
    shortcutHint,
    theme,
  } = props;

  const styleTheme = theme || 'cool';
  const styleOptions = [styles.field, styles[styleTheme]];
  const helpTextErrorStyles = combineStyles(styles.helpText, styles.helpTextError);
  const helpTextStyles = hasErrorText ? helpTextErrorStyles : styles.helpText;
  const shortcutHintDisabledStyles = combineStyles(
    styles.shortcutHint,
    styles.shortcutHintDisabled
  );
  const shortcutHintStyles = buttonDisabled ?
    shortcutHintDisabledStyles : styles.shortcutHint;

  if (isLarger) {
    styleOptions.push(styles.fieldLarger);
  }
  if (isWider) {
    styleOptions.push(styles.fieldWider);
  }

  const fieldStyles = combineStyles.apply('null', styleOptions);

  return (
    <div className={styles.fieldBlock}>
      <input
        className={fieldStyles}
        {...props}
      />
      {hasButton &&
        <div className={styles.buttonBlock}>
          <IconButton
            disabled={buttonDisabled}
            iconName={buttonIcon}
            iconSize="2x"
            onClick={onButtonClick}
          />
        </div>
      }
      {hasHelpText &&
        <div className={helpTextStyles}>{helpText}</div>
      }
      {hasShortcutHint &&
        <div className={shortcutHintStyles}>{shortcutHint}</div>
      }
    </div>
  );
};

FieldBlock.propTypes = {
  autoFocus: PropTypes.bool,
  buttonDisabled: PropTypes.bool,
  buttonIcon: PropTypes.string,
  hasButton: PropTypes.bool,
  hasErrorText: PropTypes.bool,
  hasHelpText: PropTypes.bool,
  hasShortcutHint: PropTypes.bool,
  helpText: PropTypes.object,
  isLarger: PropTypes.bool,
  isWider: PropTypes.bool,
  onBlur: PropTypes.func,
  onButtonClick: PropTypes.func,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  placeholder: PropTypes.string,
  shortcutHint: PropTypes.string,
  theme: PropTypes.oneOf([
    'cool',
    'warm'
  ]),
  type: PropTypes.string,
  value: PropTypes.string
};

const Field = props => {
  const {
    name,
  } = props;

  return (
    <div className={styles.fieldBlock}>
      <ReduxFormField
        name={name}
        component={FieldBlock}
        {...props}
      />
    </div>
  );
};

Field.propTypes = {
  autoFocus: PropTypes.bool,
  buttonDisabled: PropTypes.bool,
  buttonIcon: PropTypes.string,
  hasButton: PropTypes.bool,
  hasErrorText: PropTypes.bool,
  hasHelpText: PropTypes.bool,
  hasShortcutHint: PropTypes.bool,
  helpText: PropTypes.object,
  isLarger: PropTypes.bool,
  isWider: PropTypes.bool,
  name: PropTypes.string.isRequired,
  onBlur: PropTypes.func,
  onButtonClick: PropTypes.func,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  placeholder: PropTypes.string,
  shortcutHint: PropTypes.string,
  theme: PropTypes.oneOf([
    'cool',
    'warm'
  ]),
  type: PropTypes.string,
  value: PropTypes.string
};

styles = StyleSheet.create({
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

export default look(Field);
