import styled from '@emotion/styled'
import React, {lazy} from 'react'
import {Route} from 'react-router'
import {RouteComponentProps, Switch, withRouter} from 'react-router-dom'

const TeamSettings = lazy(
  () => import(/* webpackChunkName: 'TeamSettingsRoot' */ '../TeamSettingsRoot')
)
const TeamIntegrationsRoot = lazy(
  () =>
    import(
      /* webpackChunkName: 'TeamIntegrationsRoot' */ '../../containers/TeamIntegrationsRoot/TeamIntegrationsRoot'
    )
)

interface Props extends RouteComponentProps<{teamId: string}> {}

const IntegrationPage = styled('div')({
  alignItems: 'center',
  padding: '0 16px',
  display: 'flex',
  flexDirection: 'column'
})
const TeamSettingsWrapper = (props: Props) => {
  const {match} = props
  const {
    params: {teamId}
  } = match
  return (
    <IntegrationPage>
      <Switch>
        <Route exact path={match.url} render={(p) => <TeamSettings {...p} teamId={teamId} />} />
        <Route
          exact
          path={`${match.url}/integrations`}
          render={(p) => <TeamIntegrationsRoot {...p} teamId={teamId} />}
        />
      </Switch>
    </IntegrationPage>
  )
}

export default withRouter(TeamSettingsWrapper)
