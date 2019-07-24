import React from 'react'
import {graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import LoadableLoading from './LoadableLoading'
import QueryRenderer from './QueryRenderer/QueryRenderer'
import RelayLoadableTransitionGroup from './RelayLoadableTransitionGroup'
import UpgradeModalLoadable from './UpgradeModalLoadable'
import withAtmosphere, {
  WithAtmosphereProps
} from '../decorators/withAtmosphere/withAtmosphere'
import {DEFAULT_MENU_HEIGHT, DEFAULT_MENU_WIDTH} from '../styles/ui'
import {cacheConfig} from '../utils/constants'

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
