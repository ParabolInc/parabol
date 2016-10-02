import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';

const DashSectionControls = (props) => {
  const {children, styles} = props;
  return (
    <div className={css(styles.root)}>
      {children}
    </div>
  );
};

DashSectionControls.propTypes = {
  children: PropTypes.any
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
