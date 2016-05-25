import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import theme from 'universal/styles/theme';

const combineStyles = StyleSheet.combineStyles;

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class PushButton extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    keystroke: PropTypes.string,
    label: PropTypes.string,
    onClick: PropTypes.func,
    size: PropTypes.oneOf([
      'default',
      'large'
    ])
  }

  render() {
    const { disabled, keystroke, label, onClick, size } = this.props;
    const buttonKeystroke = keystroke || 'D';
    const buttonLabel = label || 'Delete everything!';
    const largeStyles = combineStyles(styles.button, styles.buttonLarge);
    const buttonStyles = size === 'large' ? largeStyles : styles.button;

    return (
      <div className={styles.block}>
        <button disabled={disabled} className={buttonStyles} onClick={onClick}>
          {buttonKeystroke}
        </button>
        <div className={styles.label}>{buttonLabel}</div>
      </div>
    );
  }
}

styles = StyleSheet.create({
  pushButtonGroup: {
    textAlign: 'left'
  },

  block: {
    display: 'block',
    marginBottom: '.125rem'

    // '& + &': {
    //   marginTop: '.125rem'
    // }
  },

  button: {
    backgroundColor: '#f0f1f4',
    border: 0,
    borderBottom: '2px solid #c3c5d1',
    borderRadius: '.25rem',
    color: theme.palette.warm,
    cursor: 'pointer',
    display: 'inline-block',
    fontSize: theme.typography.fs3,
    fontWeight: 700,
    lineHeight: 1,
    marginRight: '.25rem',
    padding: '.25rem',
    textAlign: 'center',
    textShadow: '0 1px 0 #fff',
    verticalAlign: 'middle',
    width: '1.5rem',

    ':focus': {
      backgroundColor: '#dcdbdf',
      borderBottom: '0',
      borderTop: '2px solid #a4a7b9',
      outline: 'none'
    }
  },

  buttonLarge: {
    fontSize: theme.typography.fs4,
    padding: '.375rem',
    width: '1.75rem'
  },

  label: {
    display: 'inline-block',
    fontFamily: theme.typography.actionUISerif,
    fontSize: theme.typography.fs3,
    fontStyle: 'italic',
    fontWeight: 400,
    verticalAlign: 'middle'
  }
});
