import React from 'react'
import {graphql} from 'react-relay'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import AnalyticsIdentifier from 'universal/components/AnalyticsIdentifier'

const query = graphql`
  query AnalyticsIdentifierRootQuery {
    viewer {
      ...AnalyticsIdentifier_viewer
    }
  }
`

interface Props extends WithAtmosphereProps, RouteComponentProps<{}> {}

const AnalyticsIdentifierRoot = (props: Props) => {
  const {atmosphere, location} = props
  const {authToken} = atmosphere
  if (!authToken) return null
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{}}
      render={({props: renderProps}) => {
        return (
          // @ts-ignore
          <AnalyticsIdentifier
            location={location}
            viewer={renderProps ? renderProps.viewer : null}
          />
        )
      }}
    />
  )
}

export default withRouter(withAtmosphere(AnalyticsIdentifierRoot))
