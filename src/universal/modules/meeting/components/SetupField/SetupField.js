import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import FontAwesome from 'react-fontawesome';
import tinycolor from 'tinycolor2';
import theme from 'universal/styles/theme';

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
    inputType: PropTypes.string,
    isLarger: PropTypes.bool,
    isWider: PropTypes.bool,
    label: PropTypes.string,
    onButtonClick: PropTypes.func,
    onInputClick: PropTypes.func,
    placeholderText: PropTypes.string,
    shortcutHint: PropTypes.string
  }

  render() {
    const {
      buttonIcon,
      hasButton,
      hasHelpText,
      hasShortcutHint,
      helpText,
      inputType,
      isLarger,
      isWider,
      label,
      onButtonClick,
      onInputClick,
      placeholderText,
      shortcutHint
    } = this.props;

    let fieldStyles = styles.field;

    const largerStyles = combineStyles(styles.field, styles.fieldLarger);
    const widerStyles = combineStyles(styles.field, styles.widerLarger);
    const largerAndWiderStyles = combineStyles(styles.field, styles.fieldLarger, styles.fieldWider);

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
          onClick={onInputClick}
          placeholder={placeholderText}
          type={inputType}
        />
        { hasButton &&
          <button className={combineStyles(styles.fieldButton, styles.fieldSubmit)} onClick={onButtonClick}>
            <FontAwesome name={buttonIcon} size="2x" />
          </button>
        }
        { hasHelpText &&
          <div className={styles.fieldHelpText}>{helpText}</div>
        }
        { hasShortcutHint &&
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

  fieldButton: {
    background: 'none',
    border: 0,
    color: theme.palette.tuColorA40o.color,
    cursor: 'pointer',
    fontSize: theme.typography.fs3,

    // NOTE: :hover, :focus, :active have the same styling
    ':hover': {
      color: theme.palette.a,
      outline: 'none'
    },
    ':focus': {
      color: theme.palette.a,
      outline: 'none'
    },
    ':active': {
      color: theme.palette.a,
      outline: 'none'
    }
  },

  // NOTE: Modifies fieldButton
  fieldSubmit: {
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
