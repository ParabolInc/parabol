import React from 'react'
import {graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import LoadableLoading from 'universal/components/LoadableLoading'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import RelayLoadableTransitionGroup from 'universal/components/RelayLoadableTransitionGroup'
import UpgradeModalLoadable from 'universal/components/UpgradeModalLoadable'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import {DEFAULT_MENU_HEIGHT, DEFAULT_MENU_WIDTH} from 'universal/styles/ui'
import {cacheConfig} from 'universal/utils/constants'

interface Props extends WithAtmosphereProps, RouteComponentProps<{}> {
  closePortal: () => void
  orgId: string
}

const query = graphql`
  query UpgradeModalRootQuery($orgId: ID!) {
    viewer {
      ...UpgradeModal_viewer
    }
  }
`

const loading = (props) => (
  <LoadableLoading {...props} height={DEFAULT_MENU_HEIGHT} width={DEFAULT_MENU_WIDTH} />
)

const UpgradeModalRoot = (props: Props) => {
  const {atmosphere, closePortal, orgId} = props
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{orgId}}
      render={(readyState) => (
        <RelayLoadableTransitionGroup
          LoadableComponent={UpgradeModalLoadable}
          loading={loading}
          readyState={readyState}
          extraProps={{closePortal}}
        />
      )}
    />
  )
}

export default withAtmosphere(withRouter(UpgradeModalRoot))
