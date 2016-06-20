import React, {Component, PropTypes} from 'react';
import {setWelcomeName, setWelcomeTeamName} from 'universal/modules/welcome/ducks/welcomeDuck';
import WelcomeFullName from '../../components/WelcomeFullName/WelcomeFullName';
import WelcomeTeam from '../../components/WelcomeTeam/WelcomeTeam';
import {connect} from 'react-redux';

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
    dispatch(setWelcomeTeamName(teamName));
    const options = {
      variables: {teamName}
    };
    cashay.mutate('createTeam', options);
  };

  render() {
    const {welcome} = this.props;
    if (!welcome.fullName) {
      return <WelcomeFullName onSubmit={this.onFullNameSubmit} {...this.props} />;
    } else if (!welcome.teamName) {
      return <WelcomeTeam onSubmit={this.onTeamNameSubmit} {...this.props} />;
    }
  }
}

