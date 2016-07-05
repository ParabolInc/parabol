import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';

let styles = {};

const NotificationBar = (props) =>
  <div className={styles.bar}>
    {props.children}
  </div>;

NotificationBar.propTypes = {
  children: PropTypes.any
};

styles = StyleSheet.create({
  bar: {
    backgroundColor: theme.palette.warm,
    color: '#fff',
    fontWeight: 700,
    padding: '1rem',
    textAlign: 'center'
  }
});

export default look(NotificationBar);
