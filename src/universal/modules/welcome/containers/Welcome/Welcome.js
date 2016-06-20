import React, {Component, PropTypes} from 'react';
import {setWelcomeName, setWelcomeTeam} from 'universal/modules/welcome/ducks/welcomeDuck';
import WelcomeFullName from '../../components/WelcomeFullName/WelcomeFullName';
import WelcomeTeam from '../../components/WelcomeTeam/WelcomeTeam';
import {connect} from 'react-redux';
import shortid from 'shortid';

const mapStateToProps = state => ({
  welcome: state.welcome
});

@connect(mapStateToProps)
export default class WelcomeContainer extends Component {
  static propTypes = {
    dispatch: PropTypes.func
  };

  onFullNameSubmit = data => {
    const {dispatch} = this.props;
    const {fullName} = data;
    dispatch(setWelcomeName(fullName));
    // dispatch(push('/welcome-team-name'));
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
    cashay.mutate('createTeamMember', createTeamMemberOptions);
    //TODO once we know where the fullname goes, cashay.mutate('updateFullName'...)

  };

  onInviteTeamSubmit = data => {
    const {dispatch, welcome: {teamId}} = this.props;
    const {inviteEmails} = data;
    cashay.mutate('inviteTeam');
    
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

