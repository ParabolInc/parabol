import React from 'react';
import {css} from 'react-emotion';
import ui from 'universal/styles/ui';

const MenuItemHR = () => {
  return (<hr className={css({
    backgroundColor: ui.menuBorderColor,
    border: 'none',
    height: '1px',
    marginBottom: ui.menuGutterVertical,
    marginTop: ui.menuGutterVertical,
    padding: 0
  })}
  />);
};

export default MenuItemHR;
