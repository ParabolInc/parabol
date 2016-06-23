import React, {Component, PropTypes} from 'react';
import {setWelcomeName, setWelcomeTeam} from 'universal/modules/welcome/ducks/welcomeDuck';
import WelcomeFullName from '../../components/WelcomeFullName/WelcomeFullName';
import WelcomeTeam from '../../components/WelcomeTeam/WelcomeTeam';
import InviteTeam from '../../components/InviteTeam/InviteTeam';
import {connect} from 'react-redux';
import shortid from 'shortid';
import {show} from 'universal/modules/notifications/ducks/notifications';
import {push} from 'react-router-redux';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import {cashay} from 'cashay';

const emailInviteSuccess = {
  title: 'Invitation sent!',
  message: `Your team members will get their invite via email`,
  level: 'success'
};

const mapStateToProps = state => ({
  welcome: state.welcome,
  response: cashay.query()
});

@connect(mapStateToProps)
@requireAuth
export default class WelcomeContainer extends Component {
  static propTypes = {
    dispatch: PropTypes.func
  };

  onFullNameSubmit = data => {
    const {dispatch} = this.props;
    const {fullName} = data;
    dispatch(setWelcomeName(fullName));
  };

  onTeamNameSubmit = data => {
    const {dispatch} = this.props;
    const {teamName} = data;
    const teamId = shortid.generate();
    const teamMemberId = shortid.generate();
    dispatch(setWelcomeTeam({teamName, teamId, teamMemberId}));
    const createTeamOptions = {
      variables: {
        newTeam: {
          id: teamId,
          name: teamName
        }
      }
    };
    const createTeamMemberOptions = {
      variables: {
        newTeamMember: {
          id: teamMemberId,
          teamId,
          isLead: true,
          isFacilitator: true
        }
      }
    };
    cashay.mutate('createTeam', createTeamOptions);
    //TODO once we know where the fullname goes, cashay.mutate('updateFullName'...)

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
        debugger
        console.log('inviteTeamRes', res);
        if (res.error) {
          // TODO make a really ambiguous error because we don't wait to figure out which emails failed 
        } else if (res.data) {
          dispatch(show(emailInviteSuccess));
        }
      });

    // TODO dispatch email success notification
    dispatch(push(`/team/${teamId}`));
  };

  render() {
    const {welcome} = this.props;
    if (!welcome.fullName) {
      return <WelcomeFullName onSubmit={this.onFullNameSubmit} {...this.props} />;
    } else if (!welcome.teamName) {
      return <WelcomeTeam onSubmit={this.onTeamNameSubmit} {...this.props} />;
    } else {
      return <InviteTeam onSubmit={this.onInviteTeamSubmit} {...this.props} />;
    }
  }
}

