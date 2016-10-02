import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';

let styles = {};

const MeetingMain = (props) =>
  <div className={styles.root}>
    {props.children}
  </div>;

MeetingMain.propTypes = {
  children: PropTypes.any
};

const styleThunk = () => ({
  root: {
    backgroundColor: '#fff',
    display: 'flex !important',
    flex: 1,
    flexDirection: 'column',
    width: '100%'
  }
});

export default withStyles(styleThunk)(MeetingMain);
