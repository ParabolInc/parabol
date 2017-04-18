import React, {PropTypes} from 'react';
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
    boxShadow: 'inset 4px 0 8px rgba(0, 0, 0, .15), inset 1px 0 1px rgba(0, 0, 0, .1)'
  }
});

export default withStyles(styleThunk)(MeetingMain);
