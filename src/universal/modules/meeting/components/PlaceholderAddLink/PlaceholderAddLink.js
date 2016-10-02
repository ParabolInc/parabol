import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import appTheme from 'universal/styles/theme/appTheme';

let s = {};

const PlaceholderAddLink = (props) => {
  const handleClick = (e) => {
    e.preventDefault();
    props.onClick();
  };
  return (
    <a className={s.root} href="#add-placeholder" onClick={(e) => handleClick(e)}>
      Press “+” to <br /><span className={s.underline}>Add a Request</span>
    </a>
  );
};

s = StyleSheet.create({
  root: {
    color: appTheme.palette.warm,
    display: 'block',
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    padding: '.5rem .75rem .5rem 4rem',
    width: '100%',

    ':hover': {
      color: appTheme.palette.warm
    },
    ':focus': {
      color: appTheme.palette.warm
    }
  },

  underline: {
    textDecoration: 'underline'
  }
});

PlaceholderAddLink.propTypes = {
  onClick: PropTypes.func
};

PlaceholderAddLink.defaultProps = {
  onClick() {
    console.log('PlaceholderAddLink onClick');
  }
};

export default withStyles(styleThunk)(PlaceholderAddLink);
