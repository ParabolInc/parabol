import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import {NavLink} from 'react-router-dom';
import DashNavItemBaseStyles from './DashNavItemBaseStyles';

const DashNavItem = (props) => {
  const {label, href, styles} = props;
  return (
    <NavLink
      activeClassName={css(styles.link, styles.active)}
      className={css(styles.link)}
      exact={href === '/me'}
      title={label}
      to={href}
    >
      {label}
    </NavLink>
  );
};

DashNavItem.propTypes = {
  href: PropTypes.string,
  label: PropTypes.string,
  styles: PropTypes.object
};

const styleThunk = () => ({
  link: {
    ...DashNavItemBaseStyles,
    ':hover': {
      backgroundColor: appTheme.palette.mid90d,
      color: 'inherit',
      cursor: 'pointer',
      textDecoration: 'none'
    },
    ':focus': {
      color: 'inherit',
      cursor: 'pointer',
      textDecoration: 'none'
    }
  },

  active: {
    backgroundColor: appTheme.palette.mid80d,
    borderColor: `${ui.palette.white} !important`,
    cursor: 'default',
    textDecoration: 'none',
    ':hover': {
      backgroundColor: appTheme.palette.mid80d,
      color: 'inherit',
      cursor: 'pointer',
      textDecoration: 'none'
    }
  }
});

// router for navlink unblock
export default withStyles(styleThunk)(DashNavItem);
