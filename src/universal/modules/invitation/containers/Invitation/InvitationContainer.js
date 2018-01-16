import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {showLock} from 'universal/components/Auth0ShowLock/Auth0ShowLock';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import withReducer from 'universal/decorators/withReducer/withReducer';
import userSettingsReducer from 'universal/modules/userDashboard/ducks/settingsDuck';
import AcceptTeamInviteEmailMutation from 'universal/mutations/AcceptTeamInviteEmailMutation';

const mapStateToProps = (state, props) => {
  const {match: {params: {id}}} = props;
  const auth = state.auth.obj;
  return {
    auth,
    inviteToken: id
  };
};

@connect(mapStateToProps)
@withReducer({userDashboardSettings: userSettingsReducer})
@withAtmosphere
export default class Invitation extends Component {
  static propTypes = {
    atmosphere: PropTypes.object.isRequired,
    auth: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    inviteToken: PropTypes.string.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  };

  state = {
    processedInvitation: false
  };

  // use DidMount to be SSR friendly
  componentDidMount() {
    const {atmosphere, auth, dispatch} = this.props;
    if (!auth.sub) {
      showLock(atmosphere, dispatch);
    } else {
      this.stateMachine(this.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    this.stateMachine(nextProps);
  }

  stateMachine = (props) => {
    const {auth} = props;
    const {processedInvitation} = this.state;
    if (auth.sub && !processedInvitation) {
      this.setState({processedInvitation: true});
      this.processInvitation();
    }
  };

  processInvitation = () => {
    const {atmosphere, dispatch, inviteToken, history} = this.props;
    AcceptTeamInviteEmailMutation(atmosphere, inviteToken, dispatch, history);
  };

  render() {
    return (
      <div>
        <LoadingView />
      </div>
    );
  }
}
