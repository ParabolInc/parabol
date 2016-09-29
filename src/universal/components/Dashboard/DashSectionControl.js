import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
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

styles = StyleSheet.create({
  root: {
    ...ib,
    color: theme.palette.mid,
    fontSize: theme.typography.s3,
    height: ui.dashSectionHeaderLineHeight,
    marginLeft: '2rem'
  }
});

export default look(DashSectionControl);
