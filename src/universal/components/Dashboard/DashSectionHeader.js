import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import ui from 'universal/styles/ui';

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
    maxWidth: ui.projectColumnsMaxWidth,
    padding: '1rem',
    position: 'relative',
    width: '100%',
    zIndex: 400
  }
});

export default look(DashSectionHeader);
