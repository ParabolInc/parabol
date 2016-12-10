import React, {Component, PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';

const Tab = (props) => {
  const {icon, isActive, label, onClick, styles} = props;
  const activeStyles = css(
    styles.root,
    isActive && styles.isActive,
    onClick && styles.canClick
  );
  return (
    <div className={activeStyles} onClick={onClick}>
      <div className={css(styles.icon)}>
        {icon}
      </div>
      <div className={css(styles.label)}>
        {label}
      </div>
    </div>
  )
};

const styleThunk = () => ({
  root: {
    alignItems: 'center',
    display: 'flex',
    flexBasis: 0,
    flexDirection: 'column',
    flexGrow: 1,
    padding: '.5rem',
  },

  canClick: {
    cursor: 'pointer'
  },

  icon: {

  },

  isActive: {
    color: appTheme.palette.cool,
  },

  label: {
    fontWeight: 700
  }
});
export default withStyles(styleThunk)(Tab);
