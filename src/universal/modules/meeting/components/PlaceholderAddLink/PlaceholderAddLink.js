import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';

let s = {};

const PlaceholderAddLink = (props) => {
  const handleClick = (e) => {
    e.preventDefault();
    props.onClick();
  };
  return (
    <a className={s.root} href="#add-placeholder" onClick={(e) => handleClick(e)}>
      Press “+” to <br /><span className={s.underline}>add a request <br />placeholder</span>
    </a>
  );
};

s = StyleSheet.create({
  root: {
    color: theme.palette.warm,
    display: 'block',
    fontSize: theme.typography.s2,
    fontWeight: 700,
    padding: '.5rem .75rem .5rem 4rem',
    width: '100%',

    ':hover': {
      color: theme.palette.warm
    },
    ':focus': {
      color: theme.palette.warm
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

export default look(PlaceholderAddLink);
