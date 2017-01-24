import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import {Link, withRouter} from 'react-router';
import DashNavItemBaseStyles from './DashNavItemBaseStyles';


const DashNavItem = (props) => {
  const {label, href, styles, router} = props;
  const flagChildren = href === '/me';
  const isActive = router.isActive(href, flagChildren);
  const linkStyles = css(
    styles.link,
    isActive && styles.active
  );
  return (
      <Link
        className={linkStyles}
        title={label}
        to={href}
      >
        {label}
      </Link>
  );
};

DashNavItem.propTypes = {
  href: PropTypes.string,
  label: PropTypes.string,
  router: PropTypes.object,
  styles: PropTypes.object
};

const linkHF = {
  backgroundColor: appTheme.palette.dark50a,
  color: 'inherit',
  cursor: 'pointer',
  textDecoration: 'none'
};

const activeHF = {
  backgroundColor: appTheme.palette.dark,
  cursor: 'default'
};

const styleThunk = () => ({
  link: {
    ...DashNavItemBaseStyles,

    ':hover': {
      ...linkHF
    },
    ':focus': {
      ...linkHF
    }
  },

  active: {
    backgroundColor: appTheme.palette.dark,

    ':hover': {
      ...activeHF
    },
    ':focus': {
      ...activeHF
    }
  }
});

export default withRouter(
  withStyles(styleThunk)(DashNavItem)
);
