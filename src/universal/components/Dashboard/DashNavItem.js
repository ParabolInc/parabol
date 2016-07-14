import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import {push} from 'react-router-redux';
import theme from 'universal/styles/theme';

const combineStyles = StyleSheet.combineStyles;
let styles = {};

const DashNavItem = (props) => {
  const activeStyles = combineStyles(styles.link, styles.active);
  const itemStyles = props.active ? activeStyles : styles.link;

  const onClick = (event) => {
    const {dispatch, href} = props;
    event.preventDefault();
    dispatch(push(href));
  };

  return (
    <div className={styles.root}>
      {props.href && !props.active ?
        <a
          className={itemStyles}
          href="#"
          onClick={(e) => onClick(e)}
          title={props.label}
        >
          {props.label}
        </a> :
        <div className={itemStyles}>
          {props.label}
        </div>
      }
    </div>
  );
};

DashNavItem.propTypes = {
  active: PropTypes.bool,
  dispatch: PropTypes.func.isRequired,
  href: PropTypes.string,
  label: PropTypes.string.isRequired,
};

styles = StyleSheet.create({
  root: {
    width: '100%'
  },

  link: {
    backgroundColor: 'transparent',
    borderRadius: '.25rem 0 0 .25rem',
    color: 'inherit',
    display: 'block',
    fontSize: theme.typography.s4,
    padding: '.3125rem .5rem .3125rem 1rem',
    userSelect: 'none',

    ':hover': {
      backgroundColor: theme.palette.dark50a,
      color: 'inherit',
      cursor: 'pointer',
      textDecoration: 'none'
    },
    ':focus': {
      backgroundColor: theme.palette.dark50a,
      color: 'inherit',
      cursor: 'pointer',
      textDecoration: 'none'
    }
  },

  active: {
    backgroundColor: theme.palette.dark,

    ':hover': {
      backgroundColor: theme.palette.dark,
      cursor: 'default'
    },
    ':focus': {
      backgroundColor: theme.palette.dark,
      cursor: 'default'
    }
  }
});

export default look(DashNavItem);
