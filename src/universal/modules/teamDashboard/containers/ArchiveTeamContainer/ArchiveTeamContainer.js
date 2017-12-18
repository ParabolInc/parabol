import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {createFragmentContainer} from 'react-relay';
import {withRouter} from 'react-router-dom';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import ArchiveTeam from 'universal/modules/teamDashboard/components/ArchiveTeam/ArchiveTeam';
import ArchiveTeamMutation from 'universal/mutations/ArchiveTeamMutation';


class ArchiveTeamContainer extends Component {
  static propTypes = {
    atmosphere: PropTypes.object.isRequired,
    team: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  };

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
    const {atmosphere, team: {teamId}, history} = this.props;
    const onCompleted = () => {
      history.push('/me');
    };
    ArchiveTeamMutation(atmosphere, teamId, undefined, onCompleted);
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
  withAtmosphere(withRouter(ArchiveTeamContainer)),
  graphql`
    fragment ArchiveTeamContainer_team on Team {
      teamId: id
      teamName: name
    }
  `
);
