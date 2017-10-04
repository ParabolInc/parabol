import {cashay} from 'cashay';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {showLock} from 'universal/components/Auth0ShowLock/Auth0ShowLock';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import withReducer from 'universal/decorators/withReducer/withReducer';
import userSettingsReducer from 'universal/modules/userDashboard/ducks/settingsDuck';
import AcceptTeamInviteEmailMutation from 'universal/mutations/AcceptTeamInviteEmailMutation';
import {getAuthedOptions, getAuthQueryString} from 'universal/redux/getAuthedUser';

const mapStateToProps = (state, props) => {
  const {match: {params: {id}}} = props;
  const auth = state.auth.obj;
  return {
    auth,
    inviteToken: id,
    user: cashay.query(getAuthQueryString, getAuthedOptions(auth.sub))
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
      /*
       const isNew = !auth.hasOwnProperty('tms');
       if (isNew) {
       // If the user is new let's process their invite:
       this.processInvitation();
       } else {
       // If user already has an account, let them accept the new team via the UI:
       history.push('/me');
       }
       */

      // NOTE: temporarily process all invitations, even for existing users:
      // TODO: remove below after team invitation acceptance added to dashboards
      // TODO scratch that, just wrap this with loginWithToken. MK
      // if (!processedInvitation) {
      this.processInvitation();
      // } else {
      //   history.push('/me');
      // }
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
