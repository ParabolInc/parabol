import PropTypes from 'prop-types'
import React, {Component} from 'react'
import LoadingView from 'universal/components/LoadingView/LoadingView'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import withReducer from 'universal/decorators/withReducer/withReducer'
import userSettingsReducer from 'universal/modules/userDashboard/ducks/settingsDuck'
import AcceptTeamInviteMutation from 'universal/mutations/AcceptTeamInviteMutation'
import requireAuthAndRole from 'universal/decorators/requireAuthAndRole/requireAuthAndRole'
import {SIGNUP_SLUG} from 'universal/utils/constants'

class Invitation extends Component {
  static propTypes = {
    atmosphere: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  }

  componentDidMount () {
    const {
      atmosphere,
      dispatch,
      match: {
        params: {inviteToken}
      },
      history
    } = this.props
    if (!inviteToken) return
    AcceptTeamInviteMutation(atmosphere, {inviteToken}, {dispatch, history})
  }

  render () {
    return (
      <div>
        <LoadingView />
      </div>
    )
  }
}

export default withReducer({userDashboardSettings: userSettingsReducer})(
  withAtmosphere(requireAuthAndRole({silent: true, unauthRoute: `/${SIGNUP_SLUG}`})(Invitation))
)
