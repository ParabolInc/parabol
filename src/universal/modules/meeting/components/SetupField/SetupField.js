import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import tinycolor from 'tinycolor2';
import theme from 'universal/styles/theme';
import IconButton from '../../components/IconButton/IconButton';

const combineStyles = StyleSheet.combineStyles;
const fieldLightGray = tinycolor.mix(theme.palette.c, '#fff', 50).toHexString();

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class SetupField extends Component {
  static propTypes = {
    buttonIcon: PropTypes.string,
    hasButton: PropTypes.bool,
    hasHelpText: PropTypes.bool,
    hasShortcutHint: PropTypes.bool,
    helpText: PropTypes.string,
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
      buttonIcon,
      hasButton,
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
    // const value = value || '';

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
          <div className={styles.fieldButtonBlock}>
            <IconButton iconName={buttonIcon} iconSize="2x" onClick={onButtonClick} />
          </div>
        }
        {hasHelpText &&
          <div className={styles.fieldHelpText}>{helpText}</div>
        }
        {hasShortcutHint &&
          <div className={styles.fieldShortcutHint}>{shortcutHint}</div>
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

  fieldLabel: {
    color: theme.palette.c,
    fontSize: theme.typography.fs4,
    lineHeight: 1.5
  },

  field: {
    border: 0,
    borderBottom: `1px dashed ${fieldLightGray}`,
    boxShadow: 'none',
    fontSize: theme.typography.fs4,
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
      color: theme.palette.a,
      outline: 'none'
    },
    ':active': {
      borderColor: '#84c6c7',
      borderStyle: 'solid',
      color: theme.palette.a,
      outline: 'none'
    }
  },

  // NOTE: Modifies field
  fieldLarger: {
    borderBottomWidth: '2px',
    fontSize: theme.typography.fs6,
    fontWeight: 400
  },

  // NOTE: Modifies field
  fieldWider: {
    minWidth: '30rem'
  },

  fieldButtonBlock: {
    left: '100%',
    padding: '0 0 0 1rem',
    position: 'absolute',
    top: '.25rem'
  },

  fieldHelpText: {
    color: theme.palette.c,
    fontSize: theme.typography.fs3,
    fontStyle: 'italic',
    fontWeight: 700
  },

  fieldShortcutHint: {
    color: theme.palette.b,
    fontSize: theme.typography.fs3,
    fontStyle: 'italic',
    fontWeight: 700,
    textAlign: 'right'
  }
});
