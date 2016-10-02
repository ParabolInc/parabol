import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import appTheme from 'universal/styles/theme/appTheme';

const DashHeaderInfo = (props) => {
  const {children, styles} = props;
  return (
    <div className={css(styles.root)}>
      <div className={css(styles.title)}>
        {props.title}
      </div>
      {children &&
      <div className={css(styles.children)}>
        {children}
      </div>
      }
    </div>
  );
};


DashHeaderInfo.propTypes = {
  children: PropTypes.any,
  title: PropTypes.string
};

const styleThunk = () => ({
  root: {
    width: '100%'
  },

  title: {
    fontSize: appTheme.typography.s5,
    lineHeight: appTheme.typography.s6,
  },

  children: {
    color: appTheme.palette.dark70l,
    fontSize: appTheme.typography.s2,
    lineHeight: appTheme.typography.sBase,
    marginTop: '.125rem'
  }
});

export default withStyles(styleThunk)(DashHeaderInfo);
