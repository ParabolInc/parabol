import React, {Children, cloneElement, PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';


const Tabs = (props) => {
  const {activeIdx, children, styles} = props;
  const tabWidth = 100 / Children.count(children);
  const inkBarStyles = {
    width: `${tabWidth}%`,
    height: 2,
    background: appTheme.palette.cool,
    transform: `translate3d(${activeIdx * 100}%, 4px, 0)`
  };
  const properChildren = Children.map(children, (child, idx) => cloneElement(child, {
    isActive: idx === activeIdx
  }));
  return (
    <div className={css(styles.tabsAndBar)}>
      <div className={css(styles.tabs)}>
        {properChildren}
      </div>
      <div style={inkBarStyles}></div>
    </div>
  );
};

Tabs.propTypes = {
  activeIdx: PropTypes.number,
  children: PropTypes.any,
  styles: PropTypes.object
};

const styleThunk = () => ({
  tabsAndBar: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '24rem',
    width: '100%',
  },

  tabs: {
    display: 'flex',
    width: '100%'

  },
  inkBar: {}
});
export default withStyles(styleThunk)(Tabs);
