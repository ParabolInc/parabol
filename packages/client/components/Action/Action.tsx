import {lazy, memo, Suspense} from 'react'
import 'react-day-picker/dist/style.css'
import {Route, Routes} from 'react-router'
import useServiceWorkerUpdater from '../../hooks/useServiceWorkerUpdater'
import {LoaderSize} from '../../types/constEnums'
import {cn} from '../../ui/cn'
import {CREATE_ACCOUNT_SLUG, SIGNIN_SLUG} from '../../utils/constants'
import ErrorBoundary from '../ErrorBoundary'
import Banner from '../GlobalBanner'
import {useIsAuthenticated} from '../IsAuthenticatedProvider'
import LoadingComponent from '../LoadingComponent/LoadingComponent'
import PrivateRoutes from '../PrivateRoutes'
import Snackbar from '../Snackbar'

const AnalyticsPage = lazy(() => import(/* webpackChunkName: 'AnalyticsPage' */ '../AnalyticsPage'))
const AuthenticationPage = lazy(
  () => import(/* webpackChunkName: 'AuthenticationPage' */ '../AuthenticationPage')
)
const DemoMeeting = lazy(() => import(/* webpackChunkName: 'DemoMeeting' */ '../DemoMeeting'))
const TeamHealthDemoPage = lazy(
  () => import(/* webpackChunkName: 'TeamHealthDemoPage' */ '../TeamHealthDemo/TeamHealthDemoPage')
)
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
const PageRoot = lazy(
  () => import(/* webpackChunkName: 'PageRoot' */ '../../modules/pages/PageRoot')
)
const OAuthAuthorizePage = lazy(
  () => import(/* webpackChunkName: 'OAuthAuthorizePage' */ '../OAuthAuthorizePage')
)
// The editor stack is a third of the entry bundle & the sign in pages do not use it
const TipTapLayout = lazy(() => import(/* webpackChunkName: 'TipTapLayout' */ '../TipTapLayout'))

const Action = memo(() => {
  useServiceWorkerUpdater()
  const isInternalAuthEnabled = window.__ACTION__.AUTH_INTERNAL_ENABLED
  // Global Banner
  const isGlobalBannerEnabled = window.__ACTION__.GLOBAL_BANNER_ENABLED
  const bannerText = window.__ACTION__.GLOBAL_BANNER_TEXT
  const bannerBgColor = window.__ACTION__.GLOBAL_BANNER_BG_COLOR
  const bannerColor = window.__ACTION__.GLOBAL_BANNER_COLOR
  // /pages must have the same stable path as the other dashboard routes
  // to preserve the internal state of the left nav (i.e. which team & pages are expanded)
  const isAuthenticated = useIsAuthenticated()

  return (
    <>
      <ErrorBoundary>
        <Snackbar />
        <Suspense fallback={<LoadingComponent spinnerSize={LoaderSize.WHOLE_PAGE} />}>
          {/* Nested so analytics never holds up the first route, but still mounts no earlier than it */}
          <Suspense fallback={null}>
            <AnalyticsPage />
          </Suspense>
          {isGlobalBannerEnabled && (
            <Banner bgColor={bannerBgColor} color={bannerColor} text={bannerText} />
          )}
          <div
            className={cn(
              'flex h-screen w-full flex-col print:h-auto',
              isGlobalBannerEnabled && `h-[calc(100vh-var(--global-banner-height))]`
            )}
          >
            <Routes>
              <Route path='/' element={<AuthenticationPage page={'signin'} />} />
              <Route path={`/${SIGNIN_SLUG}`} element={<AuthenticationPage page={'signin'} />} />
              <Route
                path={`/${CREATE_ACCOUNT_SLUG}`}
                element={<AuthenticationPage page={'create-account'} />}
              />
              <Route path='/auth/:provider' element={<AuthProvider />} />
              <Route path='/saml-redirect' element={<SAMLRedirect />} />
              <Route path='/team-health-demo/*' element={<TeamHealthDemoPage />} />
              {isInternalAuthEnabled && (
                <Route
                  path='/forgot-password'
                  element={<AuthenticationPage page={'forgot-password'} />}
                />
              )}
              {isInternalAuthEnabled && (
                <Route
                  path='/forgot-password/submitted'
                  element={<AuthenticationPage page={'forgot-password/submitted'} />}
                />
              )}
              <Route
                path='/verify-email/:verificationToken/:invitationToken'
                element={<VerifyEmail />}
              />
              <Route path='/verify-email/:verificationToken' element={<VerifyEmail />} />
              <Route path='/reset-password/:token' element={<SetNewPassword />} />
              <Route path='/oauth/authorize' element={<OAuthAuthorizePage />} />
              <Route path='/team-invitation/:token' element={<TeamInvitation />} />
              <Route path='/invitation-link/:token' element={<InvitationLink />} />
              {!isAuthenticated && (
                <Route path='/pages/:pageSlug' element={<PageRoot viewerRef={null} isPublic />} />
              )}
              {/* Any route that renders a useTipTapContext consumer must be a child of TipTapLayout */}
              <Route element={<TipTapLayout />}>
                <Route path='/retrospective-demo/*' element={<DemoMeeting />} />
                <Route path='/retrospective-demo-summary/:urlAction' element={<DemoSummary />} />
                <Route path='/retrospective-demo-summary' element={<DemoSummary />} />
                <Route path='/*' element={<PrivateRoutes />} />
              </Route>
            </Routes>
          </div>
        </Suspense>
      </ErrorBoundary>
    </>
  )
})

Action.displayName = 'Action'

export default Action
