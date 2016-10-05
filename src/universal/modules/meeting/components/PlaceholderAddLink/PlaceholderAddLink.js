import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite/no-important';
import appTheme from 'universal/styles/theme/appTheme';

const PlaceholderAddLink = (props) => {
  const {styles} = props;
  const handleClick = (e) => {
    e.preventDefault();
    props.onClick();
  };
  return (
    <a className={css(styles.root)} href="#add-placeholder" onClick={handleClick}>
      Press “+” to <br /><span className={css(styles.underline)}>Add a Request</span>
    </a>
  );
};

PlaceholderAddLink.propTypes = {
  onClick: PropTypes.func,
  styles: PropTypes.object
};

PlaceholderAddLink.defaultProps = {
  onClick() {
    console.log('PlaceholderAddLink onClick');
  }
};

const styleThunk = () => ({
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


export default withStyles(styleThunk)(PlaceholderAddLink);
