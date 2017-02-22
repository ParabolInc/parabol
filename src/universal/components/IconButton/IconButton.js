import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import FontAwesome from 'react-fontawesome';
import appTheme from 'universal/styles/theme/appTheme';

const IconButton = (props) => {
  const {disabled, iconName, iconSize, onClick, styles, title, type = 'button'} = props;
  const buttonStyles = css(
    styles.base,
    disabled && styles.disabled
  );
  // must declare type="button" or it gets treated as a submit in the welcome wizard. wtf react
  return (
    <button className={buttonStyles} disabled={disabled} onClick={onClick} title={title} type={type}>
      <FontAwesome name={iconName} size={iconSize}/>
    </button>
  );
};

IconButton.propTypes = {
  disabled: PropTypes.bool,
  iconName: PropTypes.string,
  iconSize: PropTypes.string,
  onClick: PropTypes.func,
  styles: PropTypes.object,
  title: PropTypes.string,
  type: PropTypes.string
};

const {cool} = appTheme.palette;
const baseButtonColor = appTheme.palette.cool40l;
const styleThunk = () => ({
  base: {
    background: 'transparent',
    border: 0,
    borderRadius: 0,
    color: baseButtonColor,
    cursor: 'pointer',
    fontSize: appTheme.typography.s3,
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

export default withStyles(styleThunk)(IconButton);
