import React from 'react'
import {graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import AnalyticsPage from './AnalyticsPage'
import QueryRenderer from './QueryRenderer/QueryRenderer'
import withAtmosphere, {
  WithAtmosphereProps
} from '../decorators/withAtmosphere/withAtmosphere'

const query = graphql`
  query AnalyticsPageRootQuery {
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

const AnalyticsPageRoot = (props: Props) => {
  const {atmosphere, location} = props
  const {authToken} = atmosphere
  if (!authToken) {
    return <AnalyticsPage location={location} viewer={null} />
  }
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{}}
      render={({props: renderProps}) => {
        return (
          <AnalyticsPage location={location} viewer={renderProps ? renderProps.viewer : null} />
        )
      }}
    />
  )
}

export default withRouter(withAtmosphere(AnalyticsPageRoot))
