import React, {lazy, memo, Suspense} from 'react'
import {Route, Switch} from 'react-router'
import SocketHealthMonitor from '../SocketHealthMonitor'
import {CREATE_ACCOUNT_SLUG, SIGNIN_SLUG} from '../../utils/constants'
import {LoaderSize} from '../../types/constEnums'
import ErrorBoundary from '../ErrorBoundary'
import LoadingComponent from '../LoadingComponent/LoadingComponent'
import PrivateRoutes from '../PrivateRoutes'
import {DragDropContext as dragDropContext} from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import Snackbar from '../Snackbar'

const AnalyticsPage = lazy(() =>
  import(/* webpackChunkName: 'AnalyticsPage' */ '../AnalyticsPage')
)
const AuthenticationPage = lazy(() =>
  import(/* webpackChunkName: 'AuthenticationPage' */ '../AuthenticationPage')
)
const DemoMeeting = lazy(() =>
  import(/* webpackChunkName: 'DemoMeeting' */ '../DemoMeeting')
)
const DemoSummary = lazy(() =>
  import(/* webpackChunkName: 'DemoSummary' */ '../DemoSummary')
)
const AuthProvider = lazy(() =>
  import(/* webpackChunkName: 'AuthProvider' */ '../AuthProvider')
)
const OauthRedirect = lazy(() =>
  import(/* webpackChunkName: 'OauthRedirect' */ '../OAuthRedirect')
)
const SAMLRedirect = lazy(() =>
  import(/* webpackChunkName: 'SAMLRedirect' */ '../SAMLRedirect')
)
const TeamInvitation = lazy(() =>
  import(/* webpackChunkName: 'TeamInvitationRoot' */ '../TeamInvitationRoot')
)
const InvitationLink = lazy(() =>
  import(/* webpackChunkName: 'InvitationLinkRoot' */ '../InvitationLinkRoot')
)

const Action = memo(() => {
  return (
    <ErrorBoundary>
      <Snackbar />
      <SocketHealthMonitor />
      <Suspense fallback={<LoadingComponent spinnerSize={LoaderSize.WHOLE_PAGE} />}>
        <AnalyticsPage />
        <Switch>
          <Route exact path='/' render={(p) => <AuthenticationPage {...p} page={'signin'} />} />
          <Route
            exact
            path={`/${SIGNIN_SLUG}`}
            render={(p) => <AuthenticationPage {...p} page={'signin'} />}
          />
          <Route
            exact
            path={`/${CREATE_ACCOUNT_SLUG}`}
            render={(p) => <AuthenticationPage {...p} page={'create-account'} />}
          />
          <Route exact path={`/auth/:provider`} component={AuthProvider} />
          <Route exact path={`/oauth-redirect`} component={OauthRedirect} />
          <Route path={`/saml-redirect/:token?`} component={SAMLRedirect}/>
          <Route
            path='/retrospective-demo/:localPhaseSlug?/:stageIdxSlug?'
            component={DemoMeeting}
          />
          <Route path='/retrospective-demo-summary' component={DemoSummary} />
          <Route
            exact
            path={`/reset-password`}
            render={(p) => <AuthenticationPage {...p} page={'reset-password'} />}
          />
          {/*Legacy route, still referenced by old invite emails*/}
          <Route path='/invitation/:inviteToken' component={TeamInvitation} />
          <Route path='/team-invitation/:token' component={TeamInvitation} />
          <Route path='/invitation-link/:token' component={InvitationLink} />
          <Route component={PrivateRoutes} />
        </Switch>
      </Suspense>
    </ErrorBoundary>
  )
})

export default dragDropContext(HTML5Backend)(Action)
