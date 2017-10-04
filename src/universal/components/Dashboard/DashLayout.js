import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import MeetingDashAlert from 'universal/components/MeetingDashAlert/MeetingDashAlert';

const DashLayout = (props) => {
  const {
    activeMeetings,
    children,
    styles
  } = props;
  const hasMeetingNotification = activeMeetings.length > 0;
  return (
    <div className={css(styles.root)}>
      {/* Shows over any dashboard view when there is a meeting. */}
      {hasMeetingNotification && <MeetingDashAlert activeMeetings={activeMeetings} />}
      <div className={css(styles.main)}>
        {children}
      </div>
    </div>
  );
};

DashLayout.propTypes = {
  activeMeetings: PropTypes.array.isRequired,
  children: PropTypes.any,
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
