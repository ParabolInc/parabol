import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import ib from 'universal/styles/helpers/ib';
import FontAwesome from 'react-fontawesome';
import Type from 'universal/components/Type/Type';

const DashSectionHeading = (props) => {
  const {icon, label, margin, styles} = props;
  return (
    <div className={css(styles.root)} style={{margin}}>
      <FontAwesome className={css(styles.icon)} name={icon} style={{...ib, lineHeight: 'inherit'}} />
      <Type display="inlineBlock" lineHeight={ui.dashSectionHeaderLineHeight} scale="s4" colorPalette="dark">{label}</Type>
    </div>
  );
};

DashSectionHeading.propTypes = {
  icon: PropTypes.string,
  label: PropTypes.string,
  margin: PropTypes.string,
  styles: PropTypes.object
};

DashSectionHeading.defaultProps = {
  margin: '0px'
};

const styleThunk = () => ({
  root: {
    ...ib,
    whiteSpace: 'nowrap'
  },

  icon: {
    color: appTheme.palette.dark,
    fontSize: '14px',
    marginRight: '.5rem'
  }
});

export default withStyles(styleThunk)(DashSectionHeading);
