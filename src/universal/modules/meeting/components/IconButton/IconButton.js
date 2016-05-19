import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import FontAwesome from 'react-fontawesome';
import theme from 'universal/styles/theme';

const combineStyles = StyleSheet.combineStyles;
const { cool } = theme.palette;
const baseButtonColor = theme.palette.tuColorA40o.color;

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class IconButton extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    iconName: PropTypes.string,
    iconSize: PropTypes.string,
    onClick: PropTypes.func
  }

  render() {
    const { disabled, iconName, iconSize, onClick } = this.props;
    const disabledStyles = combineStyles(styles.base, styles.disabled);
    const buttonStyles = disabled ? disabledStyles : styles.base;

    return (
      <button className={buttonStyles} disabled={disabled} onClick={onClick}>
        <FontAwesome name={iconName} size={iconSize} />
      </button>
    );
  }
}

styles = StyleSheet.create({
  base: {
    background: 'none',
    border: 0,
    borderRadius: 0,
    color: baseButtonColor,
    cursor: 'pointer',
    fontSize: theme.typography.fs3,
    padding: 0,

    // NOTE: :hover, :focus, :active have the same styling
    ':hover': {
      color: cool,
      outline: 'none'
    },
    ':focus': {
      color: cool,
      outline: 'none'
    },
    ':active': {
      color: cool,
      outline: 'none'
    }
  },

  disabled: {
    cursor: 'not-allowed',
    opacity: '.5',

    // NOTE: :hover, :focus, :active have the same styling
    ':hover': {
      color: baseButtonColor
    },
    ':focus': {
      color: baseButtonColor
    },
    ':active': {
      color: baseButtonColor
    }
  }
});
