import PropTypes from 'prop-types';
import React, {Component} from 'react';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import withReducer from 'universal/decorators/withReducer/withReducer';
import userSettingsReducer from 'universal/modules/userDashboard/ducks/settingsDuck';
import AcceptTeamInviteMutation from 'universal/mutations/AcceptTeamInviteMutation';

@withReducer({userDashboardSettings: userSettingsReducer})
@withAtmosphere
export default class Invitation extends Component {
  static propTypes = {
    atmosphere: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  };

  componentDidMount() {
    const {atmosphere, dispatch, match: {params: {inviteToken}}, history} = this.props;
    if (!inviteToken) return;
    AcceptTeamInviteMutation(atmosphere, {inviteToken}, {dispatch, history});
  }

  render() {
    return (
      <div>
        <LoadingView />
      </div>
    );
  }
}
