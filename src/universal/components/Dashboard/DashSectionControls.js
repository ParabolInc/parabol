import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';

let styles = {};

const DashSectionControls = (props) =>
  <div className={styles.root}>
    {props.children}
  </div>;

DashSectionControls.propTypes = {
  children: PropTypes.any
};

styles = StyleSheet.create({
  root: {
    flex: 1,
    height: '1.875rem',
    lineHeight: '1.8125rem',
    paddingBottom: '1px',
    textAlign: 'right'
  }
});

export default look(DashSectionControls);
