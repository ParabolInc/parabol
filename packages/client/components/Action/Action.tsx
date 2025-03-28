import {lazy, memo, Suspense} from 'react'
import 'react-day-picker/dist/style.css'
import {Route, Switch} from 'react-router'
import useServiceWorkerUpdater from '../../hooks/useServiceWorkerUpdater'
import {GlobalBanner, LoaderSize} from '../../types/constEnums'
import {CREATE_ACCOUNT_SLUG, SIGNIN_SLUG} from '../../utils/constants'
import ErrorBoundary from '../ErrorBoundary'
import Banner from '../GlobalBanner'
import LoadingComponent from '../LoadingComponent/LoadingComponent'
import PrivateRoutes from '../PrivateRoutes'
import Snackbar from '../Snackbar'

const AnalyticsPage = lazy(() => import(/* webpackChunkName: 'AnalyticsPage' */ '../AnalyticsPage'))
const AuthenticationPage = lazy(
  () => import(/* webpackChunkName: 'AuthenticationPage' */ '../AuthenticationPage')
)
const DemoMeeting = lazy(() => import(/* webpackChunkName: 'DemoMeeting' */ '../DemoMeeting'))
const DemoSummary = lazy(() => import(/* webpackChunkName: 'DemoSummary' */ '../DemoSummary'))
const AuthProvider = lazy(() => import(/* webpackChunkName: 'AuthProvider' */ '../AuthProvider'))
const SAMLRedirect = lazy(() => import(/* webpackChunkName: 'SAMLRedirect' */ '../SAMLRedirect'))
const SetNewPassword = lazy(
  () => import(/* webpackChunkName: 'SetNewPassword' */ '../ResetPasswordPage/SetNewPassword')
)
const VerifyEmail = lazy(() => import(/* webpackChunkName: 'VerifyEmail' */ '../VerifyEmail'))
const TeamInvitation = lazy(
  () => import(/* webpackChunkName: 'TeamInvitationRoot' */ '../TeamInvitationRoot')
)
const InvitationLink = lazy(
  () => import(/* webpackChunkName: 'InvitationLinkRoot' */ '../InvitationLinkRoot')
)

const Action = memo(() => {
  useServiceWorkerUpdater()
  const isInternalAuthEnabled = window.__ACTION__.AUTH_INTERNAL_ENABLED
  // Global Banner
  const isGlobalBannerEnabled = window.__ACTION__.GLOBAL_BANNER_ENABLED
  const bannerText = window.__ACTION__.GLOBAL_BANNER_TEXT
  const bannerBgColor = window.__ACTION__.GLOBAL_BANNER_BG_COLOR
  const bannerColor = window.__ACTION__.GLOBAL_BANNER_COLOR
  return (
    <>
      <ErrorBoundary>
        <Snackbar />
        <Suspense fallback={<LoadingComponent spinnerSize={LoaderSize.WHOLE_PAGE} />}>
          <AnalyticsPage />
          {isGlobalBannerEnabled && (
            <Banner bgColor={bannerBgColor} color={bannerColor} text={bannerText} />
          )}
          <div
            className='flex w-full flex-col'
            style={{
              height: isGlobalBannerEnabled ? `calc(100vh - ${GlobalBanner.HEIGHT}px)` : '100vh'
            }}
          >
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
              <Route path={`/saml-redirect`} component={SAMLRedirect} />
              <Route
                path='/retrospective-demo/:localPhaseSlug?/:stageIdxSlug?'
                component={DemoMeeting}
              />
              <Route path='/retrospective-demo-summary/:urlAction?' component={DemoSummary} />
              {isInternalAuthEnabled && (
                <Route
                  exact
                  path={`/forgot-password`}
                  render={(p) => <AuthenticationPage {...p} page={'forgot-password'} />}
                />
              )}
              {isInternalAuthEnabled && (
                <Route
                  path={`/forgot-password/submitted`}
                  render={(p) => <AuthenticationPage {...p} page={`forgot-password/submitted`} />}
                />
              )}
              <Route
                path='/verify-email/:verificationToken/:invitationToken?'
                component={VerifyEmail}
              />
              <Route path='/reset-password/:token' component={SetNewPassword} />
              <Route path='/team-invitation/:token' component={TeamInvitation} />
              <Route path='/invitation-link/:token' component={InvitationLink} />
              <Route component={PrivateRoutes} />
            </Switch>
          </div>
        </Suspense>
      </ErrorBoundary>
    </>
  )
})

Action.displayName = 'Action'

export default Action
