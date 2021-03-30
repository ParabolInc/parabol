import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {QueryRenderer} from 'react-relay'
import withAtmosphere, {
  WithAtmosphereProps
} from '../decorators/withAtmosphere/withAtmosphere'
import renderQuery from '../utils/relay/renderQuery'
import MeetingsDash from './MeetingsDash'
import {LoaderSize} from '../types/constEnums'

const query = graphql`
  query MeetingsDashRootQuery {
    viewer {
      ...MeetingsDash_viewer
    }
  }
`

interface Props extends WithAtmosphereProps { }

const MeetingsDashRoot = (props: Props) => {
  const {atmosphere} = props
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(MeetingsDash, {size: LoaderSize.PANEL})}
    />
  )
}

export default withAtmosphere(MeetingsDashRoot)
