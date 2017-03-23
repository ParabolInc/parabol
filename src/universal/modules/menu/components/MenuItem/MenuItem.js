import React, {PropTypes} from 'react';
import FontAwesome from 'react-fontawesome';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import tinycolor from 'tinycolor2';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import {textOverflow} from 'universal/styles/helpers';

const MenuItem = (props) => {
  const {
    closePortal,
    hr,
    icon,
    isActive,
    label,
    onClick,
    styles,
    title
  } = props;
  const rootStyles = css(styles.root, isActive && styles.active);
  const handleClick = () => {
    if (closePortal) {
      closePortal();
    }
    if (onClick) {
      // if a component is passed in instead of just a text label, it may not include a click handler
      onClick();
    }
  };
  const labelStyles = css(
    styles.label,
    icon && styles.labelWithIcon
  );
  const labelEl = typeof label === 'string' ? <div className={labelStyles}>{label}</div> : label;
  const titleFallbackStr = typeof label === 'string' ? label : 'Menu Item';
  const titleStr = title || titleFallbackStr;
  const iconStyle = {
    color: appTheme.palette.mid,
    fontSize: ui.iconSize,
    lineHeight: 'inherit',
    marginLeft: ui.menuGutterHorizontal,
    marginRight: '.375rem',
    textAlign: 'center',
    width: '1.25rem'
  };
  const makeIcon = () =>
    <FontAwesome name={icon} style={iconStyle} />;
  return (
    <div title={titleStr}>
      {hr === 'before' && <hr className={css(styles.hr)} />}
      <div className={rootStyles} onClick={handleClick} >
        {icon && makeIcon()}{labelEl}
      </div>
      {hr === 'after' && <hr className={css(styles.hr)} />}
    </div>
  );
};

MenuItem.propTypes = {
  closePortal: PropTypes.func,
  hr: PropTypes.oneOf([
    'before',
    'after',
  ]),
  icon: PropTypes.string,
  isActive: PropTypes.bool,
  label: PropTypes.any,
  onClick: PropTypes.func,
  styles: PropTypes.object,
  title: PropTypes.string
};

const activeBackgroundColor = tinycolor.mix(appTheme.palette.mid, '#fff', 85).toHexString();
const hoverFocusStyles = {
  backgroundColor: appTheme.palette.mid10l,
  // for the blue focus outline
  outline: 0
};
const activeHoverFocusStyles = {
  backgroundColor: activeBackgroundColor,
  styles: PropTypes.object
};


const styleThunk = () => ({
  root: {
    alignItems: 'center',
    backgroundColor: ui.menuBackgroundColor,
    cursor: 'pointer',
    display: 'flex',
    transition: `background-color ${ui.transitionFastest}`,

    ':hover': {
      ...hoverFocusStyles
    },
    ':focus': {
      ...hoverFocusStyles
    }
  },

  active: {
    backgroundColor: activeBackgroundColor,
    cursor: 'default',

    ':hover': {
      ...activeHoverFocusStyles
    },
    ':focus': {
      ...activeHoverFocusStyles
    }
  },

  label: {
    ...textOverflow,
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    lineHeight: '1.5rem',
    padding: `${ui.menuItemPaddingVertical} ${ui.menuItemPaddingHorizontal}`
  },

  labelWithIcon: {
    paddingLeft: 0
  },

  hr: {
    backgroundColor: ui.menuBorderColor,
    border: 'none',
    height: '1px',
    marginBottom: ui.menuGutterVertical,
    marginTop: ui.menuGutterVertical,
    padding: 0
  }
});

export default withStyles(styleThunk)(MenuItem);
