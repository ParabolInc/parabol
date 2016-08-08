import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import {Link} from 'react-router';

let styles = {};

const linkHF = {
  backgroundColor: theme.palette.dark50a,
  color: 'inherit',
  cursor: 'pointer',
  textDecoration: 'none'
};

const activeHF = {
  backgroundColor: theme.palette.dark,
  cursor: 'default'
};

const DashNavItem = (props) => {
  const {label, href} = props;
  return (
    <Link
      activeClassName={styles.active}
      className={styles.link}
      title={label}
      to={href}
    >
      {label}
    </Link>
  );
};

DashNavItem.propTypes = {
  href: PropTypes.string,
  label: PropTypes.string.isRequired,
};

styles = StyleSheet.create({
  root: {},

  link: {
    backgroundColor: 'transparent',
    borderRadius: '.25rem 0 0 .25rem',
    color: 'inherit',
    display: 'block',
    fontSize: theme.typography.s4,
    margin: '.5rem 0',
    padding: '.3125rem .5rem .3125rem 1rem',
    userSelect: 'none',
    width: '100%',

    ':hover': {
      ...linkHF
    },
    ':focus': {
      ...linkHF
    }
  },

  active: {
    backgroundColor: theme.palette.dark,

    ':hover': {
      ...activeHF
    },
    ':focus': {
      ...activeHF
    }
  }
});

export default look(DashNavItem);
