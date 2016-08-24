import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import FontAwesome from 'react-fontawesome';
import Type from 'universal/components/Type/Type';

const DashPanelHeading = (props) => {
  const {styles} = DashPanelHeading;
  return (
    <div className={styles.root}>
      <FontAwesome className={styles.icon} name={props.icon} style={{lineHeight: 'inherit'}} />
      <Type display="inline-block" scale="s5" theme="dark">{props.label}</Type>
    </div>
  );
};

const ib = {
  display: 'inline-block',
  verticalAlign: 'middle'
};

DashPanelHeading.propTypes = {
  icon: PropTypes.string,
  label: PropTypes.string
};

DashPanelHeading.styles = StyleSheet.create({
  root: {
    ...ib
  },

  icon: {
    ...ib,
    display: 'none',
    fontSize: '14px'
  }
});

export default look(DashPanelHeading);
