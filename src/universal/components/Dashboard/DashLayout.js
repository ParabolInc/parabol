import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import ActiveTrialNotificationBar from 'universal/components/ActiveTrialNotificationBar/ActiveTrialNotificationBar';
import ExpiredTrialNotificationBar from 'universal/components/ExpiredTrialNotificationBar/ExpiredTrialNotificationBar';
import MeetingNotificationBar from 'universal/components/MeetingNotificationBar/MeetingNotificationBar';

const DashLayout = (props) => {
  const {
    activeMeetings,
    children,
    styles
  } = props;
  const hasActiveTrial = true;
  const hasExpiredTrial = true;
  const hasMeetingNotification = activeMeetings.length > 0;
  return (
    <div className={css(styles.root)}>
      {/* Shows over any dashboard view when we prompt the trial extension (1 week after sign up?). */}
      {hasActiveTrial && <ActiveTrialNotificationBar accountLink="/me/organizations" />}
      {/* Shows over any account view when the trial has expired. */}
      {hasExpiredTrial && <ExpiredTrialNotificationBar accountLink="/me/organizations" />}
      {/* Shows over any dashboard view when there is a meeting. */}
      {hasMeetingNotification && <MeetingNotificationBar activeMeetings={activeMeetings} />}
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
  },
});

export default withStyles(styleThunk)(DashLayout);
