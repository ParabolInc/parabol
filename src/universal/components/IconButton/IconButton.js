import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import FontAwesome from 'react-fontawesome';
import theme from 'universal/styles/theme';

const combineStyles = StyleSheet.combineStyles;
const { cool } = theme.palette;
const baseButtonColor = theme.palette.cool40l;

let styles = {};

const IconButton = props => {
  const { disabled, iconName, iconSize, onClick, title } = props;
  const disabledStyles = combineStyles(styles.base, styles.disabled);
  const buttonStyles = disabled ? disabledStyles : styles.base;

  return (
    <button className={buttonStyles} disabled={disabled} onClick={onClick} title={title}>
      <FontAwesome name={iconName} size={iconSize} />
    </button>
  );
};

styles = StyleSheet.create({
  base: {
    background: 'none',
    border: 0,
    borderRadius: 0,
    color: baseButtonColor,
    cursor: 'pointer',
    fontSize: theme.typography.s3,
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

IconButton.propTypes = {
  disabled: PropTypes.bool,
  iconName: PropTypes.string,
  iconSize: PropTypes.string,
  onClick: PropTypes.func,
  title: PropTypes.string
};

export default look(IconButton);
