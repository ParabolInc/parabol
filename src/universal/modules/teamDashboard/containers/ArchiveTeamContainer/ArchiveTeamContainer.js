import {cashay} from 'cashay';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import ArchiveTeam from 'universal/modules/teamDashboard/components/ArchiveTeam/ArchiveTeam';

@withRouter
export default class ArchiveTeamContainer extends Component {
  static propTypes = {
    teamId: PropTypes.string.isRequired,
    teamName: PropTypes.string.isRequired,
    history: PropTypes.object.isRequired
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
      const {teamId, history} = this.props;
      const variables = {teamId};
      cashay.mutate('archiveTeam', {variables});
      history.push('/me');
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
