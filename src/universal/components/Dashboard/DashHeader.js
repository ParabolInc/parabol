import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';

let styles = {};

const DashHeader = (props) =>
  <div className={styles.root}>
    <div className={styles.title}>
      {props.title}
    </div>
    {props.children &&
      <div className={styles.children}>
        {props.children}
      </div>
    }
  </div>;

DashHeader.propTypes = {
  children: PropTypes.any,
  title: PropTypes.string
};

styles = StyleSheet.create({
  root: {
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
    fontSize: theme.typography.s5,
    lineHeight: theme.typography.s6,
  },

  children: {
    color: theme.palette.dark70l,
    fontSize: theme.typography.s2,
    lineHeight: theme.typography.sBase,
    marginTop: '.125rem'
  }
});

export default look(DashHeader);
