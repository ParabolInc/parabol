import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';

let styles = {};

const MeetingMain = (props) =>
  <div className={styles.root}>
    {props.children}
  </div>;

MeetingMain.propTypes = {
  children: PropTypes.any
};

styles = StyleSheet.create({
  root: {
    backgroundColor: '#fff',
    display: 'flex !important',
    flex: 1,
    flexDirection: 'column'
  }
});

export default look(MeetingMain);
