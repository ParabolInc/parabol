import React, {Children, cloneElement, Component, PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';


const Tabs = (props) => {
  const {activeIdx, children, styles} = props;
  const tabWidth = 100 / Children.count(children);
  const inkBarStyles = {
    width: `${tabWidth}%`,
    height: 4,
    background: appTheme.palette.cool,
    transform: `translate3d(${activeIdx * 100}%, 2px, 0)`
  };
  const properChildren = Children.map(children, (child, idx) => cloneElement(child, {isActive: idx === activeIdx}));
  return (
    <div className={css(styles.tabsAndBar)}>
      <div className={css(styles.tabs)}>
        {properChildren}
      </div>
      <div style={inkBarStyles}></div>
    </div>
  )
};

const styleThunk = () => ({
  tabsAndBar: {
    display: 'flex',
    flexDirection: 'column',
    width: '40%',
  },

  tabs: {
    display: 'flex',
    width: '100%'

  },
  inkBar: {

  }
});
export default withStyles(styleThunk)(Tabs);

