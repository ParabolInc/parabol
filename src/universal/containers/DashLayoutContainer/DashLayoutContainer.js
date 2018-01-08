import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {createFragmentContainer} from 'react-relay';
import DashLayout from 'universal/components/Dashboard/DashLayout';
import {setMeetingAlertState} from 'universal/modules/dashboard/ducks/dashDuck';

const getActiveMeetings = (viewer) => {
  const activeMeetings = [];
  if (viewer) {
    const {teams} = viewer;
    teams.forEach((team) => {
      if (team.meetingId) {
        activeMeetings.push({
          link: `/meeting/${team.id}`,
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
        name
      }
    }
  `
);

