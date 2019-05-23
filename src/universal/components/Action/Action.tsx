import React, {lazy, Suspense} from 'react'
import styled from 'react-emotion'
import {Route, Switch} from 'react-router'
import AnalyticsIdentifierRoot from 'universal/components/AnalyticsIdentifierRoot'
import SocketHealthMonitor from 'universal/components/SocketHealthMonitor'
import Toast from 'universal/modules/toast/containers/Toast/Toast'
import {CREATE_ACCOUNT_SLUG, SIGNIN_SLUG} from 'universal/utils/constants'
import {PALETTE} from '../../styles/paletteV2'
import {LoaderSize} from '../../types/constEnums'
import ErrorBoundary from '../ErrorBoundary'
import LoadingComponent from '../LoadingComponent/LoadingComponent'
import PrivateRoutes from '../PrivateRoutes'
import {DragDropContext as dragDropContext} from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

const ResetPasswordPage = lazy(() =>
  import(/* webpackChunkName: 'ResetPasswordPage' */ 'universal/components/ResetPasswordPage/ResetPasswordPage')
)
const AuthenticationPage = lazy(() =>
  import(/* webpackChunkName: 'AuthenticationPage' */ 'universal/components/AuthenticationPage')
)
const DemoMeeting = lazy(() =>
  import(/* webpackChunkName: 'DemoMeeting' */ 'universal/components/DemoMeeting')
)
const DemoSummary = lazy(() =>
  import(/* webpackChunkName: 'DemoSummary' */ 'universal/components/DemoSummary')
)
const AuthProvider = lazy(() =>
  import(/* webpackChunkName: 'AuthProvider' */ 'universal/components/AuthProvider')
)
const OauthRedirect = lazy(() =>
  import(/* webpackChunkName: 'GoogleOAuthProvider' */ 'universal/components/OAuthRedirect')
)
const TeamInvitation = lazy(() =>
  import(/* webpackChunkName: 'TeamInvitationRoot' */ 'universal/components/TeamInvitationRoot')
)

const ActionStyles = styled('div')({
  // bg is important since we do a slide up animation we don't want the background to slide up, too
  background: PALETTE.BACKGROUND.MAIN,
  margin: 0,
  minHeight: '100vh',
  padding: 0,
  width: '100%'
})

const Action = () => {
  return (
    <ActionStyles>
      <ErrorBoundary>
        <Toast />
        <SocketHealthMonitor />
        <AnalyticsIdentifierRoot />
        <Suspense fallback={<LoadingComponent spinnerSize={LoaderSize.WHOLE_PAGE} />}>
          <Switch>
            <Route exact path='/' component={AuthenticationPage} />
            <Route exact path={`/${SIGNIN_SLUG}`} component={AuthenticationPage} />
            <Route exact path={`/${CREATE_ACCOUNT_SLUG}`} component={AuthenticationPage} />
            <Route exact path={`/auth/:provider`} component={AuthProvider} />
            <Route exact path={`/oauth-redirect`} component={OauthRedirect} />
            <Route
              path='/retrospective-demo/:localPhaseSlug?/:stageIdxSlug?'
              component={DemoMeeting}
            />
            <Route path='/retrospective-demo-summary' component={DemoSummary} />
            <Route exact path='/reset-password' component={ResetPasswordPage} />
            {/*Legacy route, still referenced by old invite emails*/}
            <Route path='/invitation/:inviteToken' component={TeamInvitation} />
            <Route path='/team-invitation/:token' component={TeamInvitation} />
            <Route component={PrivateRoutes} />
          </Switch>
        </Suspense>
      </ErrorBoundary>
    </ActionStyles>
  )
}

export default dragDropContext(HTML5Backend)(Action)
