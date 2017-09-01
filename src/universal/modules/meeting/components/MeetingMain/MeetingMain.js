import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';

const MeetingMain = (props) => {
  const {children, hasBoxShadow, styles} = props;
  const rootStyles = css(
    styles.meetingMainRoot,
    hasBoxShadow && styles.hasBoxShadow
  );
  return (
    <div className={rootStyles}>
      {children}
    </div>
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
    boxShadow: 'inset .25rem 0 .5rem rgba(0, 0, 0, .25), inset 0 0 .0625rem rgba(0, 0, 0, .15)'
  }
});

export default withStyles(styleThunk)(MeetingMain);
