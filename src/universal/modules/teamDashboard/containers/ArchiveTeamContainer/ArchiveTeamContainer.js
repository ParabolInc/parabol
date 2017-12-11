import {cashay} from 'cashay';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {createFragmentContainer} from 'react-relay';
import {withRouter} from 'react-router-dom';
import ArchiveTeam from 'universal/modules/teamDashboard/components/ArchiveTeam/ArchiveTeam';


class ArchiveTeamContainer extends Component {
  static propTypes = {
    team: PropTypes.object.isRequired,
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

  archiveTeam = async () => {
    const {team: {teamId}, history} = this.props;
    const variables = {teamId};
    cashay.mutate('archiveTeam', {variables});
    history.push('/me');
  }

  render() {
    const {team: {teamName}} = this.props;
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

export default createFragmentContainer(
  withRouter(ArchiveTeamContainer),
  graphql`
    fragment ArchiveTeamContainer_team on Team {
      teamId: id
      teamName: name
    }
  `
);
