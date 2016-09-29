import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import ui from 'universal/styles/ui';
import {textOverflow} from 'universal/styles/helpers';
import MenuItem from './MenuItem';
// TODO: add option for labels with icons
// import FontAwesome from 'react-fontawesome';

const Menu = (props) => {
  const {styles} = Menu;
  const {closeMenu, hasShadow, items, label} = props;
  const boxShadow = '0 1px 1px rgba(0, 0, 0, .15)';
  const rootStyle = hasShadow ? {boxShadow} : null;
  return (
    <div ref={(div) => {
      if (div) {
        div.focus();
      }
    }} className={styles.root} style={rootStyle} tabIndex="0" onBlur={closeMenu} >
      <div className={styles.label}>{label}</div>
      {items.map((item, idx) =>
        <MenuItem
          isActive={item.isActive}
          key={`MenuItem${idx}`}
          label={item.label}
          onClick={item.handleClick}
        />
      )}
    </div>
  );
};

Menu.propTypes = {
  hasShadow: PropTypes.bool,
  items: PropTypes.array,
  label: PropTypes.string
};

Menu.defaultProps = {
  hasShadow: true
};

Menu.styles = StyleSheet.create({
  root: {
    backgroundColor: ui.menuBackgroundColor,
    border: `1px solid ${theme.palette.mid30l}`,
    borderRadius: '.25rem',
    padding: '0 0 .5rem',
    width: '100%'
  },

  label: {
    ...textOverflow,
    borderBottom: `1px solid ${theme.palette.mid30l}`,
    color: theme.palette.mid,
    fontSize: theme.typography.s2,
    fontWeight: 700,
    lineHeight: 1,
    padding: '.5rem'
  }
});

export default look(Menu);
