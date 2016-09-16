import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import ib from 'universal/styles/helpers/ib';
import FontAwesome from 'react-fontawesome';
import Type from 'universal/components/Type/Type';

const DashPanelHeading = (props) => {
  const {styles} = DashPanelHeading;
  return (
    <div className={styles.root}>
      <FontAwesome className={styles.icon} name={props.icon} style={{...ib, lineHeight: 'inherit'}} />
      <Type display="inlineBlock" scale="s4" theme="dark">{props.label}</Type>
    </div>
  );
};

DashPanelHeading.propTypes = {
  icon: PropTypes.string,
  label: PropTypes.string
};

DashPanelHeading.styles = StyleSheet.create({
  root: {
    ...ib,
    whiteSpace: 'nowrap'
  },

  icon: {
    color: theme.palette.dark,
    fontSize: '14px',
    marginRight: '.5rem'
  }
});

export default look(DashPanelHeading);
