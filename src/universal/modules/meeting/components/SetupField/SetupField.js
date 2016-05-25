import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import tinycolor from 'tinycolor2';
import theme from 'universal/styles/theme';
import IconButton from '../../components/IconButton/IconButton';

const combineStyles = StyleSheet.combineStyles;
const fieldLightGray = tinycolor.mix(theme.palette.dark, '#fff', 50).toHexString();

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class SetupField extends Component {
  static propTypes = {
    buttonDisabled: PropTypes.bool,
    buttonIcon: PropTypes.string,
    hasButton: PropTypes.bool,
    hasErrorText: PropTypes.bool,
    hasHelpText: PropTypes.bool,
    hasShortcutHint: PropTypes.bool,
    helpText: PropTypes.object,
    type: PropTypes.string,
    value: PropTypes.string,
    isLarger: PropTypes.bool,
    isWider: PropTypes.bool,
    onButtonClick: PropTypes.func,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    placeholder: PropTypes.string,
    shortcutHint: PropTypes.string
  }

  render() {
    const {
      buttonDisabled,
      buttonIcon,
      hasButton,
      hasErrorText,
      hasHelpText,
      hasShortcutHint,
      helpText,
      type,
      value,
      isLarger,
      isWider,
      onButtonClick,
      onBlur,
      onChange,
      onFocus,
      placeholder,
      shortcutHint
    } = this.props;

    let fieldStyles = styles.field;

    const largerStyles = combineStyles(styles.field, styles.fieldLarger);
    const widerStyles = combineStyles(styles.field, styles.widerLarger);
    const largerAndWiderStyles = combineStyles(styles.field, styles.fieldLarger, styles.fieldWider);
    const helpTextErrorStyles = combineStyles(styles.helpText, styles.helpTextError);
    const helpTextStyles = hasErrorText ? helpTextErrorStyles : styles.helpText;
    const shortcutHintDisabledStyles = combineStyles(
      styles.shortcutHint,
      styles.shortcutHintDisabled
    );
    const shortcutHintStyles = buttonDisabled ?
      shortcutHintDisabledStyles : styles.shortcutHint;

    if (isLarger && isWider) {
      fieldStyles = largerAndWiderStyles;
    } else if (isLarger) {
      fieldStyles = largerStyles;
    } else if (isWider) {
      fieldStyles = widerStyles;
    }

    return (
      <div className={styles.fieldBlock}>
        <input
          className={fieldStyles}
          onBlur={onBlur}
          onChange={onChange}
          onFocus={onFocus}
          placeholder={placeholder}
          type={type}
          value={value}
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
  }
}

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
    fontSize: theme.typography.s4,
    fontWeight: 700,
    lineHeight: 1.5,
    margin: '0 0 .5rem',
    padding: '.125rem .5rem',
    width: '100%',

    '::selection': {
      backgroundColor: '#e6f4f4'
    },

    '::placeholder': {
      color: fieldLightGray
    },

    // NOTE: :focus, :active have same styles
    ':focus': {
      borderColor: '#84c6c7',
      borderStyle: 'solid',
      color: theme.palette.cool,
      outline: 'none'
    },
    ':active': {
      borderColor: '#84c6c7',
      borderStyle: 'solid',
      color: theme.palette.cool,
      outline: 'none'
    }
  },

  // NOTE: Modifies field
  fieldLarger: {
    borderBottomWidth: '2px',
    fontSize: theme.typography.s6,
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
    color: theme.palette.dark,
    fontSize: theme.typography.s3,
    fontStyle: 'italic',
    fontWeight: 700
  },

  // NOTE: Modifies helpText
  helpTextError: {
    color: theme.palette.warm
  },

  shortcutHint: {
    color: theme.palette.warm,
    fontSize: theme.typography.s3,
    fontStyle: 'italic',
    fontWeight: 700,
    textAlign: 'right'
  },

  // NOTE: Modifies shortcutHint
  shortcutHintDisabled: {
    opacity: '.5'
  }
});
