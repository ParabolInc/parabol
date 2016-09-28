import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import tinycolor from 'tinycolor2';
import theme from 'universal/styles/theme';
import {textOverflow} from 'universal/styles/helpers';
import MenuItem from './MenuItem';
// TODO: add option for labels with icons
// import FontAwesome from 'react-fontawesome';

const Menu = (props) => {
  const {styles} = Menu;
  const {items, label} = props;
  return (
    <div className={styles.root}>
      <div className={styles.label}>{label}</div>
      {items.map((item, idx) =>
        <MenuItem
          isActive={item.isActive}
          key={`MenuItem${idx}`}
          label={item.label}
          onClick={item.onClick}
        />
      )}
    </div>
  );
};

const backgroundColor = tinycolor.mix(theme.palette.mid, '#fff', 95).toHexString();

Menu.propTypes = {
  items: PropTypes.array,
  label: PropTypes.string
};

Menu.styles = StyleSheet.create({
  root: {
    backgroundColor,
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
    padding: '.5rem'
  }
});

export default look(Menu);
