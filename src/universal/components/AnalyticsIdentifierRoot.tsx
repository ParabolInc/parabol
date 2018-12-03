import React from 'react'
import {graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import AnalyticsIdentifier from 'universal/components/AnalyticsIdentifier'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'

const query = graphql`
  query AnalyticsIdentifierRootQuery {
    viewer {
      viewerId: id
      created: createdAt
      avatar: picture
      name: preferredName
      email
    }
  }
`

interface Props extends WithAtmosphereProps, RouteComponentProps<{}> {}

const AnalyticsIdentifierRoot = (props: Props) => {
  const {atmosphere, location} = props
  const {authToken} = atmosphere
  if (!authToken) {
    return <AnalyticsIdentifier location={location} viewer={null} />
  }
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{}}
      render={({props: renderProps}) => {
        return (
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
