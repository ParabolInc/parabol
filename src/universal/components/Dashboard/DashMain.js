import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';

let styles = {};

const DashMain = (props) =>
  <div className={styles.root}>
    {props.children}
  </div>;

DashMain.propTypes = {
  children: PropTypes.any
};

styles = StyleSheet.create({
  root: {
    display: 'flex !important',
    flex: 1,
    flexDirection: 'column'
  }
});

export default look(DashMain);
