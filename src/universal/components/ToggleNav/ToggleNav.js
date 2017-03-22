import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import FontAwesome from 'react-fontawesome';

//    TODO:
//  • Add themes, not just mid/purple (TA)
//  • Make icons optional (TA)
//  • Add disabled styles (TA)

const iconStyles = {
  lineHeight: 'inherit',
  paddingRight: '.25rem'
};

const ToggleNav = (props) => {
  const {
    items,
    styles
  } = props;

  const renderItems = () =>
    items.map((item, index) => {
      const itemStyles = css(
        styles.item,
        // Avoid className order conflicts and set active here
        item.isActive && styles.itemActive,
        index === 0 && styles.itemFirst,
        index === (items.length - 1) && styles.itemLast
      );
      return (
        <div className={itemStyles} key={item.label} onClick={item.onClick}>
          <FontAwesome name={item.icon} style={iconStyles} /> {item.label}
        </div>
      );
    }
  );

  return (
    <div className={css(styles.nav)}>
      {renderItems()}
    </div>
  );
};

ToggleNav.propTypes = {
  items: PropTypes.array.isRequired,
  styles: PropTypes.object
};

ToggleNav.defaultProps = {
  items: [
    {
      label: 'Billing',
      icon: 'credit-card',
      isActive: true,
      onClick: () => {}
    },
    {
      label: 'Members',
      icon: 'users',
      isActive: false,
      onClick: () => {}
    }
  ]
};

const borderRadius = ui.borderRadiusSmall;

const styleThunk = () => ({
  nav: {
    display: 'flex',
    width: '100%'
  },

  item: {
    backgroundColor: 'transparent',
    border: `1px solid ${appTheme.palette.mid}`,
    borderLeftWidth: 0,
    color: appTheme.palette.mid,
    cursor: 'pointer',
    flex: 1,
    fontSize: appTheme.typography.s3,
    fontWeight: 700,
    lineHeight: '1.625rem',
    textAlign: 'center',
    textDecoration: 'none',

    // NOTE: hover/focus are the same
    // NOTE: overriding anchor styles
    ':hover': {
      backgroundColor: appTheme.palette.mid10a,
      color: appTheme.palette.mid70d,
      textDecoration: 'none',
    },
    ':focus': {
      backgroundColor: appTheme.palette.mid10a,
      color: appTheme.palette.mid70d,
      textDecoration: 'none',
    }
  },

  itemActive: {
    backgroundColor: appTheme.palette.mid,
    color: '#fff',
    cursor: 'default',

    // NOTE: hover/focus are the same
    // NOTE: overriding anchor styles
    ':hover': {
      backgroundColor: appTheme.palette.mid,
      color: '#fff'
    },
    ':focus': {
      backgroundColor: appTheme.palette.mid,
      color: '#fff'
    }
  },

  itemFirst: {
    borderBottomLeftRadius: borderRadius,
    borderLeftWidth: 1,
    borderTopLeftRadius: borderRadius
  },

  itemLast: {
    borderBottomRightRadius: borderRadius,
    borderTopRightRadius: borderRadius
  }
});

export default withStyles(styleThunk)(ToggleNav);
