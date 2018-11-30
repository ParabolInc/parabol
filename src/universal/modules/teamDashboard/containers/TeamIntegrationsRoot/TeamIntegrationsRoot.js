import PropTypes from 'prop-types'
import React from 'react'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import GitHubRepoAddedSubscription from 'universal/subscriptions/GitHubRepoAddedSubscription'
import GitHubRepoRemovedSubscription from 'universal/subscriptions/GitHubRepoRemovedSubscription'
import IntegrationLeftSubscription from 'universal/subscriptions/IntegrationLeftSubscription'
import SlackChannelAddedSubscription from 'universal/subscriptions/SlackChannelAddedSubscription'
import SlackChannelRemovedSubscription from 'universal/subscriptions/SlackChannelRemovedSubscription'
import {DEFAULT_TTL, GITHUB} from 'universal/utils/constants'
import GitHubMemberRemovedSubscription from 'universal/subscriptions/GitHubMemberRemovedSubscription'
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId'
import RelayTransitionGroup from 'universal/components/RelayTransitionGroup'
import LoadingView from 'universal/components/LoadingView/LoadingView'
import ProviderList from 'universal/modules/teamDashboard/components/ProviderList/ProviderList'
import {withRouter} from 'react-router'
import IntegrationSubscription from 'universal/subscriptions/IntegrationSubscription'

const teamIntegrationsQuery = graphql`
  query TeamIntegrationsRootQuery($teamId: ID!) {
    viewer {
      ...ProviderList_viewer
    }
  }
`

const subscriptions = [
  IntegrationSubscription,
  GitHubMemberRemovedSubscription,
  GitHubRepoAddedSubscription,
  GitHubRepoRemovedSubscription,
  SlackChannelAddedSubscription,
  SlackChannelRemovedSubscription,
  // if they're the last ones to leave, it'll remove the repo
  IntegrationLeftSubscription(GITHUB)
]

const cacheConfig = {ttl: DEFAULT_TTL}

const TeamIntegrationsRoot = ({atmosphere, history, teamMemberId}) => {
  const {teamId} = fromTeamMemberId(teamMemberId)
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={teamIntegrationsQuery}
      variables={{teamId}}
      subscriptions={subscriptions}
      subParams={{teamId, history}}
      render={(readyState) => (
        <RelayTransitionGroup
          readyState={readyState}
          error={<ErrorComponent height={'14rem'} />}
          loading={<LoadingView minHeight='50vh' />}
          ready={<ProviderList teamId={teamId} />}
        />
      )}
    />
  )
}

TeamIntegrationsRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  teamMemberId: PropTypes.string.isRequired,
  viewer: PropTypes.object
}

export default withRouter(withAtmosphere(TeamIntegrationsRoot))
