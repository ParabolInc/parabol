import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';

let styles = {};

const DashHeader = (props) =>
  <div className={styles.root}>
    {props.children}
  </div>;

DashHeader.propTypes = {
  children: PropTypes.any
};

styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottom: '2px solid rgba(0, 0, 0, .10)',
    display: 'flex',
    minHeight: '4.875rem',
    padding: '1rem',
    width: '100%'
  }
});

export default look(DashHeader);
