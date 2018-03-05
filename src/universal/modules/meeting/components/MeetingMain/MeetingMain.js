import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import ErrorBoundary from 'universal/components/ErrorBoundary';
import withStyles from 'universal/styles/withStyles';

const MeetingMain = (props) => {
  const {children, hasBoxShadow, styles} = props;
  const rootStyles = css(
    styles.meetingMainRoot,
    hasBoxShadow && styles.hasBoxShadow
  );
  return (
    <ErrorBoundary>
      <div className={rootStyles}>
        {children}
      </div>
    </ErrorBoundary>
  );
};


MeetingMain.propTypes = {
  children: PropTypes.any,
  hasBoxShadow: PropTypes.bool,
  styles: PropTypes.object
};

const styleThunk = () => ({
  meetingMainRoot: {
    display: 'flex !important',
    flex: 1,
    flexDirection: 'column',
    minWidth: '60rem',
    width: '100%'
  },

  hasBoxShadow: {
    // similar to shadow[2] (depth .25rem, blur-radius .5rem)
    // boxShadow: 'inset .25rem 0 .5rem rgba(0, 0, 0, .25), inset 0 0 .0625rem rgba(0, 0, 0, .15)'
    boxShadow: 'inset .0625rem 0 0 rgba(0, 0, 0, .05)'
  }
});

export default withStyles(styleThunk)(MeetingMain);
