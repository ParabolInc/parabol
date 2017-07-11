import {css} from 'aphrodite-local-styles/no-important';
import withStyles from 'universal/styles/withStyles';
import PropTypes from 'prop-types';
import React, {Children, cloneElement} from 'react';
import appTheme from 'universal/styles/theme/appTheme';


const Tabs = (props) => {
  const {activeKey, children, styles} = props;
  const tabWidth = 100 / Children.count(children);

  let activeIdx = 0;
  const properChildren = Children.map(children, (child, idx) => {
    if (child.key === activeKey) {
      activeIdx = idx;
      return cloneElement(child, {isActive: true});
    }
    return child;
  });
  const inkBarStyles = {
    width: `${tabWidth}%`,
    height: 2,
    background: appTheme.palette.cool,
    transform: `translate3d(${activeIdx * 100}%, 4px, 0)`
  };
  return (
    <div className={css(styles.tabsAndBar)}>
      <div className={css(styles.tabs)}>
        {properChildren}
      </div>
      <div style={inkBarStyles} />
    </div>
  );
};

Tabs.propTypes = {
  activeKey: PropTypes.string.isRequired,
  children: PropTypes.any,
  styles: PropTypes.object
};

const styleThunk = () => ({
  tabsAndBar: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '24rem',
    width: '100%'
  },

  tabs: {
    display: 'flex',
    width: '100%'

  },
  inkBar: {}
});
export default withStyles(styleThunk)(Tabs);
