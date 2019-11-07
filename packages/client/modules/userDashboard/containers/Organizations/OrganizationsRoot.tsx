import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {QueryRenderer} from 'react-relay'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../../decorators/withAtmosphere/withAtmosphere'
import {LoaderSize} from '../../../../types/constEnums'
import renderQuery from '../../../../utils/relay/renderQuery'
import Organizations from '../../components/Organizations/Organizations'

const query = graphql`
  query OrganizationsRootQuery {
    viewer {
      ...Organizations_viewer
    }
  }
`

interface Props extends WithAtmosphereProps {}

const OrganizationsRoot = (props: Props) => {
  const {atmosphere} = props
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(Organizations, {size: LoaderSize.PANEL})}
    />
  )
}

export default withAtmosphere(OrganizationsRoot)
