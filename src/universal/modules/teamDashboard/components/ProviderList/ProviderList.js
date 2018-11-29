import PropTypes from 'prop-types'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import Panel from 'universal/components/Panel/Panel'
import ProviderRow from 'universal/modules/teamDashboard/components/ProviderRow/ProviderRow'
import {GITHUB, SLACK} from 'universal/utils/constants'
import SettingsWrapper from 'universal/components/Settings/SettingsWrapper'

const ProviderList = (props) => {
  const {viewer, teamId} = props
  const {providerMap} = viewer
  return (
    <SettingsWrapper>
      <Panel hideFirstRowBorder>
        <ProviderRow name={GITHUB} providerDetails={providerMap[GITHUB]} teamId={teamId} />
        <ProviderRow name={SLACK} providerDetails={providerMap[SLACK]} teamId={teamId} />
      </Panel>
    </SettingsWrapper>
  )
}

ProviderList.propTypes = {
  viewer: PropTypes.object.isRequired,
  teamId: PropTypes.string
}

export default createFragmentContainer(
  ProviderList,
  graphql`
    fragment ProviderList_viewer on User {
      providerMap(teamId: $teamId) {
        GitHubIntegration {
          ...ProviderRow_providerDetails
        }
        SlackIntegration {
          ...ProviderRow_providerDetails
        }
      }
    }
  `
)
