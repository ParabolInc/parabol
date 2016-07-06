import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import {push} from 'react-router-redux';
import theme from 'universal/styles/theme';

const combineStyles = StyleSheet.combineStyles;
let styles = {};

const DashNavItem = (props) => {
  const activeStyles = combineStyles(styles.root, styles.active);
  const itemStyles = props.active ? activeStyles : styles.root;

  const onClick = (event) => {
    const {dispatch, href} = props;
    event.preventDefault();
    dispatch(push(href));
  };

  return (
    <div className={itemStyles} title={props.label}>
      {props.href && !props.active ?
        <a className={styles.link} href="#" onClick={(e) => onClick(e)}>{props.label}</a> :
        props.label
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
    backgroundColor: 'transparent',
    borderRadius: '.25rem 0 0 .25rem',
    fontSize: theme.typography.s4,
    padding: '.3125rem .5rem .3125rem 1rem',

    ':hover': {
      backgroundColor: theme.palette.dark50a,
      cursor: 'pointer'
    },
    ':focus': {
      backgroundColor: theme.palette.dark50a,
      cursor: 'pointer'
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
  },

  link: {
    color: 'inherit',

    ':hover': {
      color: 'inherit',
      textDecoration: 'none'
    },
    ':focus': {
      color: 'inherit',
      textDecoration: 'none'
    }
  }
});

export default look(DashNavItem);
