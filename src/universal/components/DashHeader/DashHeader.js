import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';

let styles = {};

const DashHeader = (props) =>
  <div className={styles.header}>
    <div className={styles.title}>{props.title}</div>
    <div className={styles.meta}>{props.meta}</div>
  </div>;

DashHeader.propTypes = {
  meta: PropTypes.string,
  title: PropTypes.string
};

styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    borderBottom: '2px solid rgba(0, 0, 0, .10)',
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '4.875rem',
    padding: '1rem',
    width: '100%'
  },

  title: {
    fontSize: theme.typography.s5
  },

  meta: {
    color: theme.palette.dark70l,
    fontSize: theme.typography.s2,
    marginTop: '.125rem'
  }
});

export default look(DashHeader);
