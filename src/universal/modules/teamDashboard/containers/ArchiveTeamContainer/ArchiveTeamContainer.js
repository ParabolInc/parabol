import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import {cashay} from 'cashay';
import ArchiveTeam from 'universal/modules/teamDashboard/components/ArchiveTeam/ArchiveTeam';
import {segmentEventTrack} from 'universal/redux/segmentActions';

@connect()
@withRouter
export default class ArchiveTeamContainer extends Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
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
      const {dispatch, teamId, router} = this.props;
      const variables = {teamId};
      cashay.mutate('archiveTeam', {variables});
      dispatch(segmentEventTrack('Archive Team', { teamId }));
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
