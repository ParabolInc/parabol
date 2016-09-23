import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import ui from 'universal/styles/ui';
import ib from 'universal/styles/helpers/ib';
import FontAwesome from 'react-fontawesome';
import Type from 'universal/components/Type/Type';

const DashSectionHeading = (props) => {
  const {styles} = DashSectionHeading;
  return (
    <div className={styles.root} style={{margin: props.margin}}>
      <FontAwesome className={styles.icon} name={props.icon} style={{...ib, lineHeight: 'inherit'}} />
      <Type display="inlineBlock" lineHeight={ui.dashSectionHeaderLineHeight} scale="s4" theme="dark">{props.label}</Type>
    </div>
  );
};

DashSectionHeading.propTypes = {
  icon: PropTypes.string,
  label: PropTypes.string,
  margin: PropTypes.string
};

DashSectionHeading.defaultProps = {
  margin: '0px'
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
