import React from 'react'
import {graphql} from 'react-relay'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import {cacheConfig} from 'universal/utils/constants'
import {LoaderSize} from '../../../../types/constEnums'
import renderQuery from '../../../../utils/relay/renderQuery'
import Organizations from 'universal/modules/userDashboard/components/Organizations/Organizations'

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
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{}}
      render={renderQuery(Organizations, {size: LoaderSize.PANEL})}
    />
  )
}

export default withAtmosphere(OrganizationsRoot)
