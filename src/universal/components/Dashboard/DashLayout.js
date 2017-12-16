import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import MeetingDashAlert from 'universal/components/MeetingDashAlert/MeetingDashAlert';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';

const DashLayout = (props) => {
  const {
    activeMeetings,
    children,
    hasMeetingAlert,
    styles
  } = props;
  return (
    <div className={css(styles.root)}>
      {/* Shows over any dashboard view when there is a meeting. */}
      {hasMeetingAlert && <MeetingDashAlert activeMeetings={activeMeetings} />}
      <div className={css(styles.main)}>
        {children}
      </div>
    </div>
  );
};

DashLayout.propTypes = {
  activeMeetings: PropTypes.array,
  children: PropTypes.any,
  hasMeetingAlert: PropTypes.bool,
  styles: PropTypes.object
};

const styleThunk = () => ({
  root: {
    backgroundColor: '#fff',
    display: 'flex !important',
    flexDirection: 'column',
    minHeight: '100vh',
    minWidth: ui.dashMinWidth
  },

  main: {
    display: 'flex !important',
    flex: 1,
    position: 'relative'
  }
});

export default withStyles(styleThunk)(DashLayout);
