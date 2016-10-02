import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import appTheme from 'universal/styles/theme/appTheme';

let styles = {};

const DashHeaderInfo = (props) =>
  <div className={styles.root}>
    <div className={styles.title}>
      {props.title}
    </div>
    {props.children &&
      <div className={styles.children}>
        {props.children}
      </div>
    }
  </div>;

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
