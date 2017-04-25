import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import {Link, withRouter} from 'react-router';
import DashNavItemBaseStyles from './DashNavItemBaseStyles';
import makeHoverFocus from 'universal/styles/helpers/makeHoverFocus';

const DashNavItem = (props) => {
  const {
    href,
    label,
    orgLabel,
    router,
    styles
  } = props;
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
      <div className={css(styles.label)}>{label}</div>
      {orgLabel &&
        <div className={css(styles.orgLabel)}>{orgLabel}</div>
      }
    </Link>
  );
};

DashNavItem.propTypes = {
  href: PropTypes.string,
  label: PropTypes.string,
  orgLabel: PropTypes.string,
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
  },

  label: {
    lineHeight: '1.375'
  },

  orgLabel: {
    color: '#fff',
    fontSize: appTheme.typography.s1,
    fontWeight: 700,
    lineHeight: appTheme.typography.sBase,
    opacity: '.5'
  }
});

export default withRouter(
  withStyles(styleThunk)(DashNavItem)
);
