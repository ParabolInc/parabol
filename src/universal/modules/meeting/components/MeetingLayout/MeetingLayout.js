import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';

// TODO: Reorganize under new folder: /meeting/components/MeetingLayouts (TA)

let styles = {};

const MeetingLayout = (props) =>
  <div className={styles.root}>
    {props.children}
  </div>;

MeetingLayout.propTypes = {
  children: PropTypes.any
};

styles = StyleSheet.create({
  root: {
    backgroundColor: '#fff',
    content: '"MeetingLayout"',
    display: 'flex !important',
    minHeight: '100vh'
  }
});

export default look(MeetingLayout);
