import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';

const DashMain = (props) => {
  const {children, styles} = props;
  return (
    <div className={css(styles.root)}>
      {children}
    </div>
  );
};

DashMain.propTypes = {
  children: PropTypes.any,
  styles: PropTypes.object
};

const styleThunk = () => ({
  root: {
    display: 'flex !important',
    flex: 1,
    flexDirection: 'column',
    minWidth: '64rem'
  }
});

export default withStyles(styleThunk)(DashMain);
