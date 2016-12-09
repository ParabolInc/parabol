import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';

const DashHeader = (props) => {
  const {children, hasOverlay, styles} = props;
  const rootStyles = css(
    styles.root,
    hasOverlay && styles.hasOverlay
  );
  return (
    <div className={rootStyles}>
      {children}
    </div>
  );
};

DashHeader.propTypes = {
  children: PropTypes.any,
  hasOverlay: PropTypes.bool,
  styles: PropTypes.object
};

const styleThunk = () => ({
  root: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottom: '2px solid rgba(0, 0, 0, .10)',
    display: 'flex',
    minHeight: '4.875rem',
    padding: '1rem 1rem 0',
    width: '100%'
  },

  hasOverlay: {
    filter: 'blur(1.5px)'
  }
});

export default withStyles(styleThunk)(DashHeader);
