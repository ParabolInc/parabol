import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Redirect, withRouter} from 'react-router-dom';
import {bindActionCreators} from 'redux';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import withReducer from 'universal/decorators/withReducer/withReducer';
import userSettingsReducer from 'universal/modules/userDashboard/ducks/settingsDuck';
import {setInviteToken} from 'universal/redux/invitationDuck';

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators({setInviteToken}, dispatch),
  dispatch
});

@connect(null, mapDispatchToProps)
@withReducer({userDashboardSettings: userSettingsReducer})
@withRouter
@withAtmosphere
export default class Invitation extends Component {
  static propTypes = {
    atmosphere: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    setInviteToken: PropTypes.func.isRequired
  };

  componentDidMount() {
    const {setInviteToken} = this.props; // eslint-disable-line no-shadow
    setInviteToken(this.getInviteToken());
  }

  getInviteToken = () => (
    this.props.match.params.id
  );

  render() {
    return (
      <Redirect to={{pathname: '/signin'}} />
    );
  }
}
