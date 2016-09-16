import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';

let styles = {};

const DashSectionHeader = (props) =>
  <div className={styles.root}>
    {props.children}
  </div>;

DashSectionHeader.propTypes = {
  children: PropTypes.any
};

styles = StyleSheet.create({
  root: {
    display: 'flex',
    padding: '1rem',
    width: '100%'
  }
});

export default look(DashSectionHeader);
