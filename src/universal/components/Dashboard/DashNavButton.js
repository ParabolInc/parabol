import React, {PropTypes} from 'react';
import FontAwesome from 'react-fontawesome';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import makeHoverFocus from 'universal/styles/helpers/makeHoverFocus';
import {Link, withRouter} from 'react-router';

const DashNavButton = (props) => {
  const {icon, href, router, styles, title} = props;
  const flagChildren = href === '/me';
  const isActive = router.isActive(href, flagChildren);
  const buttonStyles = css(
    styles.button,
    isActive && styles.isActive
  );
  const iconStyle = {
    fontSize: ui.iconSize,
    lineHeight: 'inherit'
  };
  return (
    <Link
      className={buttonStyles}
      title={title}
      to={href}
    >
      <FontAwesome name={icon} style={iconStyle} />
    </Link>
  );
};

DashNavButton.propTypes = {
  colorPalette: PropTypes.oneOf([
    'cool',
    'warm'
  ]),
  href: PropTypes.string,
  icon: PropTypes.string,
  router: PropTypes.object,
  styles: PropTypes.object,
  title: PropTypes.string
};

DashNavButton.propTypes = {
  href: '/me/settings/notifications'
};

const defaultHF = {
  opacity: '.5'
};

const activeHF = {
  backgroundColor: appTheme.palette.dark,
  cursor: 'default',
  opacity: 1
};

const buttonSize = '2rem';
const styleThunk = (theme, props) => ({
  button: {
    appearance: 'none',
    backgroundColor: 'rgba(255, 255, 255, .7)',
    border: 'none',
    borderRadius: ui.buttonBorderRadius,
    boxShadow: 'none',
    color: `${appTheme.palette[props.colorPalette] || appTheme.palette.cool} !important`,
    cursor: 'pointer',
    height: buttonSize,
    lineHeight: buttonSize,
    marginRight: '.75rem',
    outline: 'none',
    position: 'absolute',
    right: '100%',
    userSelect: 'none',
    textAlign: 'center',
    textDecoration: 'none !important',
    top: 0,
    width: buttonSize,

    ...makeHoverFocus(defaultHF)
  },

  isActive: {
    backgroundColor: appTheme.palette.dark,
    color: '#fff !important',

    ...makeHoverFocus(activeHF)
  }
});

export default withRouter(
  withStyles(styleThunk)(DashNavButton)
);
