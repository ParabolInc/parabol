import React, {Component, PropTypes} from 'react';
import {withRouter} from 'react-router';
import ArchiveTeam from 'universal/modules/teamDashboard/components/ArchiveTeam/ArchiveTeam';
import {cashay} from 'cashay';

@withRouter
export default class ArchiveTeamContainer extends Component {

  static propTypes = {
    teamId: PropTypes.string.isRequired,
    teamName: PropTypes.string.isRequired,
    router: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {showConfirmationField: false};
  }

  handleClick = () => {
    this.setState({showConfirmationField: true});
  }

  formBlurred = () => {
    this.setState({showConfirmationField: false});
  }

  archiveTeam = () => {
    return new Promise((resolve) => {
      const {teamId, router} = this.props;
      const variables = {teamId};
      cashay.mutate('archiveTeam', {variables});
      router.push('/me');
      resolve();
    });
  }

  render() {
    const {teamName} = this.props;
    const {showConfirmationField} = this.state;
    return (
      <ArchiveTeam
        teamName={teamName}
        handleClick={this.handleClick}
        handleFormBlur={this.formBlurred}
        handleFormSubmit={this.archiveTeam}
        showConfirmationField={showConfirmationField}
      />
    );
  }
}
