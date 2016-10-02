import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';

let styles = {};

const MeetingLayout = (props) =>
  <div className={styles.root}>
    {props.children}
  </div>;

MeetingLayout.propTypes = {
  children: PropTypes.any
};

const styleThunk = () => ({
  root: {
    backgroundColor: '#fff',
    display: 'flex !important',
    minHeight: '100vh'
  }
});

export default withStyles(styleThunk)(MeetingLayout);
