import PropTypes from 'prop-types';
import React, {Component} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {Link} from 'react-router-dom';
import plural from 'universal/utils/plural';
import {commitLocalUpdate} from 'react-relay';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import DashAlert from 'universal/components/Dashboard/DashAlert';

class MeetingDashAlert extends Component {
  componentDidMount () {
    const {atmosphere} = this.props;
    const {viewerId} = atmosphere;
    commitLocalUpdate(atmosphere, (store) => {
      store.get(viewerId).setValue(true, 'hasMeetingAlert');
    });
  }

  componentWillUnmount () {
    const {atmosphere} = this.props;
    const {viewerId} = atmosphere;
    commitLocalUpdate(atmosphere, (store) => {
      store.get(viewerId).setValue(false, 'hasMeetingAlert');
    });
  }

  render () {
    const {activeMeetings, styles} = this.props;
    return (
      <DashAlert colorPalette="warm">
        <div className={css(styles.inlineBlock, styles.message)}>
          {`${plural(activeMeetings.length, 'Meeting')} in progress:`}
        </div>
        <div className={css(styles.inlineBlock)}>
          {activeMeetings.map((meeting) => {
            return (
              <Link
                key={meeting.link}
                className={css(styles.link)}
                title="Join Active Meeting"
                to={meeting.link}
              >
                {meeting.name}
              </Link>
            );
          })}
        </div>
      </DashAlert>
    );
  }
}

MeetingDashAlert.propTypes = {
  activeMeetings: PropTypes.array,
  atmosphere: PropTypes.object.isRequired,
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
    fontWeight: 600,
    paddingLeft: '1rem'
  }
});

export default withStyles(styleThunk)(withAtmosphere(MeetingDashAlert));
