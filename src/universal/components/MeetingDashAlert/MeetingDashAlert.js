import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {Link} from 'react-router';
import plural from 'universal/utils/plural';
import {DashAlert} from 'universal/components/Dashboard';

const MeetingDashAlert = (props) => {
  const {activeMeetings, styles} = props;
  return (
    <DashAlert colorPalette="warm">
      <div className={css(styles.inlineBlock, styles.message)}>
        {`${plural(activeMeetings.length, 'Meeting')} in progress:`}
      </div>
      <div className={css(styles.inlineBlock)}>
        {activeMeetings.map((meeting) => {
          return (
            <Link key={meeting.link} className={css(styles.link)} title="Join Active Meeting" to={meeting.link}>
              {meeting.name}
            </Link>
          );
        })}
      </div>
    </DashAlert>
  );
};

MeetingDashAlert.propTypes = {
  activeMeetings: PropTypes.array,
  styles: PropTypes.object
};

const styleThunk = () => ({
  inlineBlock: {
    display: 'inline-block',
    margin: '0 1rem',
    verticalAlign: 'top'
  },

  link: {
    color: 'inherit',
    textDecoration: 'underline',

    ':hover': {
      color: 'inherit',
      opacity: '.5'
    },
    ':focus': {
      color: 'inherit',
      opacity: '.5'
    },
    paddingRight: '1rem'
  },

  message: {
    fontWeight: 700,
    paddingLeft: '1rem'
  }
});

export default withStyles(styleThunk)(MeetingDashAlert);
