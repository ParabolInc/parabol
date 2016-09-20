import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import ib from 'universal/styles/helpers/ib';
import FontAwesome from 'react-fontawesome';
import Type from 'universal/components/Type/Type';

const DashSectionHeading = (props) => {
  const {styles} = DashSectionHeading;
  return (
    <div className={styles.root}>
      <FontAwesome className={styles.icon} name={props.icon} style={{...ib, lineHeight: 'inherit'}} />
      <Type display="inlineBlock" lineHeight="1.875rem" scale="s4" theme="dark">{props.label}</Type>
    </div>
  );
};

DashSectionHeading.propTypes = {
  icon: PropTypes.string,
  label: PropTypes.string
};

DashSectionHeading.styles = StyleSheet.create({
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

export default look(DashSectionHeading);
