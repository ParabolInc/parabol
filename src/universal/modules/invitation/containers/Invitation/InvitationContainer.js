import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import {showLock} from 'universal/components/Auth0ShowLock/Auth0ShowLock';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import {showError, showSuccess, showWarning} from 'universal/modules/toast/ducks/toastDuck';
import {setAuthToken} from 'universal/redux/authDuck';
import {getAuthQueryString, getAuthedOptions} from 'universal/redux/getAuthedUser';
import {setWelcomeActivity} from 'universal/modules/userDashboard/ducks/settingsDuck';
import jwtDecode from 'jwt-decode';
import {
  invalidInvitation,
  inviteNotFound,
  inviteExpired,
  teamAlreadyJoined,
  successfulJoin,
  successfulExistingJoin
} from 'universal/modules/invitation/helpers/notifications';
import withReducer from 'universal/decorators/withReducer/withReducer';
import userSettingsReducer from 'universal/modules/userDashboard/ducks/settingsDuck';

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
export default class Invitation extends Component {
  static propTypes = {
    auth: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    inviteToken: PropTypes.string.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  };

  // use DidMount to be SSR friendly
  componentDidMount() {
    const {auth, dispatch} = this.props;
    this.state = {processedInvitation: false};
    if (!auth.sub) {
      showLock(dispatch);
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
    const {dispatch, inviteToken, history} = this.props;
    const options = {
      variables: {
        inviteToken
      }
    };
    cashay.mutate('acceptInvitation', options)
      .then(({data, error}) => {
        if (error) {
          if (error.subtype === 'alreadyJoined') {
            /*
             * This should be *very* difficult to have occur:
             */
            dispatch(showError(teamAlreadyJoined));
            history.push('/me/settings');
          } else if (error.subtype === 'invalidToken') {
            dispatch(showError(invalidInvitation));
          } else if (error.subtype === 'notFound') {
            dispatch(showWarning(inviteNotFound));
          } else if (error.subtype === 'expiredInvitation') {
            dispatch(showWarning(inviteExpired));
          } else {
            console.warn('unable to accept invitation:');
            console.warn(error);
          }
          // history.push('/');
        } else if (data) {
          const authToken = data.acceptInvitation;
          const {tms} = jwtDecode(authToken);
          dispatch(setAuthToken(authToken));
          if (tms.length <= 1) {
            dispatch(showSuccess(successfulJoin));
            dispatch(setWelcomeActivity(`/team/${tms[0]}`));
            history.push('/me/settings');
          } else {
            dispatch(showSuccess(successfulExistingJoin));
            history.push(`/team/${tms[tms.length - 1]}`);
          }
        }
      })
      .catch(console.warn.bind(console));
  };

  render() {
    return (
      <div>
        <LoadingView />
      </div>
    );
  }
}
