import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ib from 'universal/styles/helpers/ib';
import ui from 'universal/styles/ui';

const DashSectionControl = (props) => {
  const {children, styles} = props;
  return (
    <div className={css(styles.root)}>
      {children}
    </div>
  );
};

DashSectionControl.propTypes = {
  children: PropTypes.any,
  styles: PropTypes.object
};

const styleThunk = () => ({
  root: {
    ...ib,
    color: appTheme.palette.mid,
    fontSize: appTheme.typography.s3,
    height: ui.dashSectionHeaderLineHeight,
    marginLeft: '2rem'
  }
});

export default withStyles(styleThunk)(DashSectionControl);
