import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {formValueSelector} from 'redux-form';
import shortid from 'shortid';
import {push} from 'react-router-redux';
import {cashay} from 'cashay';
import {HotKeys} from 'react-hotkeys';
import {setWelcomeTeam} from 'universal/modules/welcome/ducks/welcomeDuck';
import {show} from 'universal/modules/notifications/ducks/notifications';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import getAuth from 'universal/redux/getAuth';
import {
  Step1PreferredName,
  Step2TeamName,
  Step3InviteTeam
} from '../../components/WelcomeWizardForms';

const keyMap = {
  keyEnter: 'enter',
  seqHelp: 'shift+/', // TODO: presently unused
};

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

const selector = formValueSelector('welcomeWizard');

const mapStateToProps = state => ({
  inviteesRaw: selector(state, 'inviteesRaw'),
  preferredName: selector(state, 'preferredName'),
  teamName: selector(state, 'teamName'),
  welcome: state.welcome
});

@connect(mapStateToProps)
@requireAuth
export default class WelcomeContainer extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    inviteesRaw: PropTypes.string,
    preferredName: PropTypes.string,
    teamName: PropTypes.string,
    welcome: PropTypes.shape({
      teamId: PropTypes.string,
      teamMemberId: PropTypes.string
    })
  };

  constructor(props) {
    super(props);
    this.onPreferredNameSubmit = this.onPreferredNameSubmit.bind(this);
    this.onTeamNameSubmit = this.onTeamNameSubmit.bind(this);
    this.onInviteTeamSubmit = this.onInviteTeamSubmit.bind(this);
    this.state = {
      page: 1
    };
  }

  onPreferredNameSubmit = data => {
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
    cashay.mutate('updateUserProfile', options);
    this.nextPage();
  };

  onTeamNameSubmit = data => {
    const {dispatch} = this.props;
    const {teamName} = data;
    const teamId = shortid.generate();
    const teamMemberId = shortid.generate();
    const {user} = getAuth();
    dispatch(setWelcomeTeam({teamId, teamMemberId}));
    const createTeamOptions = {
      variables: {
        newTeam: {
          id: teamId,
          name: teamName,
          leader: [{
            id: teamMemberId,
            teamId,
            cachedUserId: user.id,
            isActive: true,
            isLead: true,
            isFacilitator: true
          }]
        }
      }
    };
    cashay.mutate('createTeam', createTeamOptions);
    this.nextPage();
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

  nextPage() {
    this.setState({ page: this.state.page + 1 });
  }

  previousPage() {
    this.setState({ page: this.state.page - 1 });
  }

  render() {
    const {page} = this.state;
    return (
      <HotKeys focused attach={window} keyMap={keyMap}>
        {page === 1 && <Step1PreferredName
          onSubmit={this.onPreferredNameSubmit} {...this.props}
        />}
        {page === 2 && <Step2TeamName
          onSubmit={this.onTeamNameSubmit} {...this.props}
        />}
        {page === 3 && <Step3InviteTeam
          onSubmit={this.onInviteTeamSubmit} {...this.props}
        />}
      </HotKeys>
    );
  }
}
