import PropTypes from 'prop-types'
import React from 'react'
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import TeamArchive from 'universal/modules/teamDashboard/components/TeamArchive/TeamArchive'
import RelayTransitionGroup from 'universal/components/RelayTransitionGroup'
import LoadingView from 'universal/components/LoadingView/LoadingView'

const query = graphql`
  query TeamArchiveRootQuery($teamId: ID!, $first: Int!, $after: DateTime) {
    viewer {
      ...TeamArchive_viewer
    }
  }
`

const TeamArchiveRoot = ({atmosphere, match, team}) => {
  const {
    params: {teamId}
  } = match
  const {userId} = atmosphere
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{teamId, first: 40}}
      render={(readyState) => (
        <RelayTransitionGroup
          readyState={readyState}
          error={<ErrorComponent height={'14rem'} />}
          loading={<LoadingView minHeight='50vh' />}
          ready={<TeamArchive teamId={teamId} team={team} userId={userId} />}
        />
      )}
    />
  )
}

TeamArchiveRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  team: PropTypes.object
}

export default withAtmosphere(TeamArchiveRoot)
