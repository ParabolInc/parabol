import PropTypes from 'prop-types'
import React from 'react'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import GitHubIntegrations from 'universal/modules/teamDashboard/components/GitHubIntegrations/GitHubIntegrations'
import {DEFAULT_TTL, GITHUB} from 'universal/utils/constants'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent'
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent'
import GitHubRepoAddedSubscription from 'universal/subscriptions/GitHubRepoAddedSubscription'
import GitHubRepoRemovedSubscription from 'universal/subscriptions/GitHubRepoRemovedSubscription'
import IntegrationJoinedSubscription from 'universal/subscriptions/IntegrationJoinedSubscription'
import IntegrationLeftSubscription from 'universal/subscriptions/IntegrationLeftSubscription'
import GitHubMemberRemovedSubscription from 'universal/subscriptions/GitHubMemberRemovedSubscription'
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId'
import IntegrationSubscription from 'universal/subscriptions/IntegrationSubscription'

const githubRepoQuery = graphql`
  query GitHubIntegrationsRootQuery($teamId: ID!, $service: IntegrationServiceEnum!) {
    viewer {
      ...GitHubIntegrations_viewer
    }
  }
`

const subscriptions = [
  GitHubMemberRemovedSubscription,
  GitHubRepoAddedSubscription,
  GitHubRepoRemovedSubscription,
  IntegrationSubscription,
  IntegrationJoinedSubscription(GITHUB),
  IntegrationLeftSubscription(GITHUB)
]

const cacheConfig = {ttl: DEFAULT_TTL}

const GitHubIntegrationsRoot = ({atmosphere, teamMemberId}) => {
  const {teamId} = fromTeamMemberId(teamMemberId)
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={githubRepoQuery}
      variables={{teamId, service: GITHUB}}
      subscriptions={subscriptions}
      subParams={{teamId}}
      render={({error, props}) => {
        if (error) {
          return <ErrorComponent error={error} />
        } else if (props) {
          const {viewer} = props
          return <GitHubIntegrations jwt={atmosphere.authToken} viewer={viewer} teamId={teamId} />
        }
        return <LoadingComponent height={'14rem'} />
      }}
    />
  )
}

GitHubIntegrationsRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  teamMemberId: PropTypes.string.isRequired,
  viewer: PropTypes.object
}

export default withAtmosphere(GitHubIntegrationsRoot)
