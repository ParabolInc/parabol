import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import {Link, withRouter} from 'react-router';
import DashNavItemBaseStyles from './DashNavItemBaseStyles';
import makeHoverFocus from 'universal/styles/helpers/makeHoverFocus';

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

const styleThunk = () => ({
  link: {
    ...DashNavItemBaseStyles,

    ...makeHoverFocus({
      backgroundColor: appTheme.palette.dark50a,
      color: 'inherit',
      cursor: 'pointer',
      textDecoration: 'none'
    })
  },

  active: {
    backgroundColor: appTheme.palette.dark,

    ...makeHoverFocus({
      backgroundColor: appTheme.palette.dark,
      cursor: 'default'
    })
  }
});

export default withRouter(
  withStyles(styleThunk)(DashNavItem)
);
