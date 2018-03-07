import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import {NavLink} from 'react-router-dom';
import DashNavItemBaseStyles from './DashNavItemBaseStyles';
import FontAwesome from 'react-fontawesome';

const DashNavItem = (props) => {
  const {label, href, icon, styles} = props;
  const iconStyle = {
    display: 'block',
    fontSize: ui.iconSize,
    height: ui.iconSize,
    lineHeight: ui.iconSize,
    opacity: '.5',
    textAlign: 'left',
    width: '1.625rem'
  };
  return (
    <NavLink
      activeClassName={css(styles.link, styles.active)}
      className={css(styles.link)}
      exact={href === '/me'}
      title={label}
      to={href}
    >
      {icon &&
        <FontAwesome name={icon} style={iconStyle} />
      }
      <div className={css(styles.label)}>{label}</div>
    </NavLink>
  );
};

DashNavItem.propTypes = {
  href: PropTypes.string,
  icon: PropTypes.string,
  label: PropTypes.string,
  styles: PropTypes.object
};

const styleThunk = () => ({
  link: {
    ...DashNavItemBaseStyles,
    ':hover': {
      backgroundColor: ui.navMenuDarkBackgroundColorHover,
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
    backgroundColor: ui.navMenuDarkBackgroundColorActive,
    borderColor: `${ui.palette.white} !important`,
    cursor: 'default',
    textDecoration: 'none',
    ':hover': {
      backgroundColor: ui.navMenuDarkBackgroundColorActive,
      color: 'inherit',
      cursor: 'pointer',
      textDecoration: 'none'
    }
  },

  label: {
    flex: 1
  }
});

// router for navlink unblock
export default withStyles(styleThunk)(DashNavItem);
