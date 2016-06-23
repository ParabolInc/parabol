import React, {Component, PropTypes} from 'react';
import {setWelcomeName, setWelcomeTeam} from 'universal/modules/welcome/ducks/welcomeDuck';
import WelcomePreferredName from '../../components/WelcomePreferredName/WelcomePreferredName';
import WelcomeTeam from '../../components/WelcomeTeam/WelcomeTeam';
import InviteTeam from '../../components/InviteTeam/InviteTeam';
import {connect} from 'react-redux';
import shortid from 'shortid';
import {show} from 'universal/modules/notifications/ducks/notifications';
import {push} from 'react-router-redux';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import {cashay} from 'cashay';
import getAuth from 'universal/redux/getAuth';

const emailInviteSuccess = {
  title: 'Invitation sent!',
  message: 'Your team members will get their invite via email',
  level: 'success'
};

const emailInviteFail = emailsNotDelivered => ({
  title: 'Invitations not sent!',
  message: `The following emails were not sent: ${emailsNotDelivered}`,
  level: 'error'
});

const mapStateToProps = state => ({
  welcome: state.welcome
});

@connect(mapStateToProps)
@requireAuth
export default class WelcomeContainer extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    welcome: PropTypes.shape({
      preferredName: PropTypes.string,
      teamName: PropTypes.string,
      teamId: PropTypes.string,
      teamMemberId: PropTypes.string
    })
  };

  onPreferredNameSubmit = data => {
    const {dispatch} = this.props;
    const {preferredName} = data;
    const {user} = getAuth();
    const options = {
      variables: {
        updatedProfile: {
          id: user.id,
          preferredName
        }
      }
    };
    dispatch(setWelcomeName(preferredName));
    cashay.mutate('updateUserProfile', options);
  };

  onTeamNameSubmit = data => {
    const {dispatch} = this.props;
    const {teamName} = data;
    const teamId = shortid.generate();
    const teamMemberId = shortid.generate();
    const {user} = getAuth();
    dispatch(setWelcomeTeam({teamName, teamId, teamMemberId}));
    const createTeamOptions = {
      variables: {
        newTeam: {
          id: teamId,
          name: teamName,
          leader: {
            id: teamMemberId,
            teamId,
            cachedUserId: user.id,
            isActive: true,
            isLead: true,
            isFacilitator: true
          }
        }
      }
    };
    cashay.mutate('createTeam', createTeamOptions);
  };

  onInviteTeamSubmit = data => {
    const {dispatch, welcome: {teamId}} = this.props;
    const {invitees} = data;
    const options = {
      variables: {
        teamId,
        invitees
      }
    };
    cashay.mutate('inviteTeam', options)
      .then(res => {
        // TODO make sure this resolves after the route changes
        console.log('inviteTeamRes', res);
        if (res.error) {
          const {failedEmails} = JSON.parse(res.error);
          if (Array.isArray(failedEmails)) {
            const emailsNotDelivered = failedEmails.map(invitee => invitee.email).join(', ');
            dispatch(show(emailInviteFail(emailsNotDelivered)));
          }
        } else if (res.data) {
          dispatch(show(emailInviteSuccess));
        }
      });

    // TODO dispatch email success notification
    dispatch(push(`/team/${teamId}`));
  };

  render() {
    const {welcome} = this.props;
    if (!welcome.preferredName) {
      return <WelcomePreferredName onSubmit={this.onPreferredNameSubmit} {...this.props} />;
    } else if (!welcome.teamName) {
      return <WelcomeTeam onSubmit={this.onTeamNameSubmit} {...this.props} />;
    }
    return <InviteTeam onSubmit={this.onInviteTeamSubmit} {...this.props} />;
  }
}

