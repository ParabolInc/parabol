import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';

let styles = {};

const DashHeaderInfo = (props) =>
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

DashHeaderInfo.propTypes = {
  children: PropTypes.any,
  title: PropTypes.string
};

styles = StyleSheet.create({
  root: {
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

export default look(DashHeaderInfo);
