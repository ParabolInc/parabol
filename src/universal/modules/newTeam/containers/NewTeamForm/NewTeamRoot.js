import PropTypes from 'prop-types'
import React from 'react'
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import NewTeam from 'universal/modules/newTeam/NewTeam'
import RelayTransitionGroup from 'universal/components/RelayTransitionGroup'
import LoadingView from 'universal/components/LoadingView/LoadingView'

const query = graphql`
  query NewTeamRootQuery {
    viewer {
      ...NewTeam_viewer
    }
  }
`

const NewTeamRoot = ({
  atmosphere,
  match: {
    params: {defaultOrgId}
  }
}) => {
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      render={(readyState) => (
        <RelayTransitionGroup
          readyState={readyState}
          error={<ErrorComponent height={'14rem'} />}
          loading={<LoadingView minHeight='50vh' />}
          ready={<NewTeam defaultOrgId={defaultOrgId} />}
        />
      )}
    />
  )
}

NewTeamRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
}

export default withAtmosphere(NewTeamRoot)
