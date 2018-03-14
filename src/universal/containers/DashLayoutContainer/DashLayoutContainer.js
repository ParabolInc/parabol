import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {createFragmentContainer} from 'react-relay';
import DashLayout from 'universal/components/Dashboard/DashLayout';
import {setMeetingAlertState} from 'universal/modules/dashboard/ducks/dashDuck';
import {ACTION} from 'universal/utils/constants';
import {meetingTypeToSlug} from 'universal/utils/meetings/lookups';

const getActiveMeetings = (viewer) => {
  const activeMeetings = [];
  if (viewer) {
    const {teams} = viewer;
    teams.forEach((team) => {
      const {meetingId, newMeeting} = team;
      if (meetingId) {
        const meetingType = newMeeting ? newMeeting.meetingType : ACTION;
        const meetingSlug = meetingTypeToSlug[meetingType];
        activeMeetings.push({
          link: `/${meetingSlug}/${team.id}`,
          name: team.name
        });
      }
    });
  }
  return activeMeetings;
};

const maybeSetDashAlert = (activeMeetings, hasMeetingAlert, dispatch) => {
  const shouldHaveMeetingAlert = activeMeetings.length > 0;
  if (shouldHaveMeetingAlert !== hasMeetingAlert) {
    dispatch(setMeetingAlertState(shouldHaveMeetingAlert));
  }
};

const mapStateToProps = (state) => {
  return {
    hasMeetingAlert: state.dash.hasMeetingAlert
  };
};

class DashLayoutContainer extends Component {
  static propTypes = {
    children: PropTypes.any,
    dispatch: PropTypes.func.isRequired,
    hasMeetingAlert: PropTypes.bool,
    viewer: PropTypes.object
  };

  constructor(props) {
    super(props);
    const {dispatch, hasMeetingAlert, viewer} = props;
    const activeMeetings = getActiveMeetings(viewer);
    this.state = {activeMeetings};
    maybeSetDashAlert(activeMeetings, hasMeetingAlert, dispatch);
  }

  componentWillReceiveProps(nextProps) {
    const {dispatch, hasMeetingAlert, viewer} = nextProps;
    const {viewer: oldViewer} = this.props;
    if (viewer !== oldViewer) {
      const activeMeetings = getActiveMeetings(viewer);
      maybeSetDashAlert(activeMeetings, hasMeetingAlert, dispatch);
      this.setState({activeMeetings});
    }
  }

  render() {
    const {activeMeetings} = this.state;
    const {hasMeetingAlert, children, viewer} = this.props;
    if (!viewer) return null;
    return (
      <DashLayout activeMeetings={activeMeetings} hasMeetingAlert={hasMeetingAlert}>
        {children}
      </DashLayout>
    );
  }
}

export default createFragmentContainer(
  connect(mapStateToProps)(DashLayoutContainer),
  graphql`
    fragment DashLayoutContainer_viewer on User {
      teams {
        id
        meetingId
        newMeeting {
          id
          meetingType
        }
        name
      }
    }
  `
);

