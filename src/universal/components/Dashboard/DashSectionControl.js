import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import appTheme from 'universal/styles/theme/appTheme';
import ib from 'universal/styles/helpers/ib';
import ui from 'universal/styles/ui';

let styles = {};

const DashSectionControl = (props) =>
  <div className={styles.root}>
    {props.children}
  </div>;

DashSectionControl.propTypes = {
  children: PropTypes.any
};

const styleThunk = () => ({
  root: {
    ...ib,
    color: appTheme.palette.mid,
    fontSize: appTheme.typography.s3,
    height: ui.dashSectionHeaderLineHeight,
    marginLeft: '2rem'
  }
});

export default withStyles(styleThunk)(DashSectionControl);
