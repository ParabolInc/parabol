import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import ActiveTrialDashAlert from 'universal/components/ActiveTrialDashAlert/ActiveTrialDashAlert';
import ExpiredTrialDashAlert from 'universal/components/ExpiredTrialDashAlert/ExpiredTrialDashAlert';
import MeetingDashAlert from 'universal/components/MeetingDashAlert/MeetingDashAlert';
import {TRIAL_EXPIRES_SOON, TRIAL_EXPIRED} from 'universal/utils/constants';

const DashLayout = (props) => {
  const {
    activeMeetings,
    children,
    styles,
    trialNotification
  } = props;
  const hasMeetingNotification = activeMeetings.length > 0;
  const {type: barType, orgId} = trialNotification || {};
  return (
    <div className={css(styles.root)}>
      {/* Shows over any dashboard view when we prompt the trial extension (1 week after sign up?). */}
      {barType === TRIAL_EXPIRES_SOON && <ActiveTrialDashAlert accountLink={`/me/organizations/${orgId}`} />}
      {/* Shows over any account view when the trial has expired. */}
      {barType === TRIAL_EXPIRED && <ExpiredTrialDashAlert accountLink={`/me/organizations/${orgId}`} />}
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
  styles: PropTypes.object,
  trialNotification: PropTypes.object
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
