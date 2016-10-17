import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';

const DashSectionControls = (props) => {
  const {children, styles} = props;
  return (
    <div className={css(styles.root)}>
      {children}
    </div>
  );
};

DashSectionControls.propTypes = {
  children: PropTypes.any,
  styles: PropTypes.object
};

const styleThunk = () => ({
  root: {
    flex: 1,
    height: '1.875rem',
    lineHeight: '1.8125rem',
    paddingBottom: '1px',
    textAlign: 'right'
  }
});

export default withStyles(styleThunk)(DashSectionControls);
