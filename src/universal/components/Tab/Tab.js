import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

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
  );
};

Tab.propTypes = {
  icon: PropTypes.any,
  isActive: PropTypes.bool,
  label: PropTypes.string,
  onClick: PropTypes.func,
  styles: PropTypes.object,
};

const styleThunk = () => ({
  root: {
    alignItems: 'center',
    color: appTheme.palette.dark,
    display: 'flex',
    flexBasis: 0,
    flexDirection: 'column',
    flexGrow: 1,
    fontSize: appTheme.typography.s3,
    padding: '0 0 .1875rem'
  },

  canClick: {
    cursor: 'pointer'
  },

  icon: {
    fontSize: ui.iconSize2x
  },

  isActive: {
    color: appTheme.palette.cool,
  },

  label: {
    fontWeight: 700
  }
});
export default withStyles(styleThunk)(Tab);
