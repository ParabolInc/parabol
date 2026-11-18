import {createRoute, lazyRouteComponent, notFound} from '@tanstack/react-router'
import invitationLinkQuery, {
  type InvitationLinkQuery
} from '../../__generated__/InvitationLinkQuery.graphql'
import teamInvitationQuery, {
  type TeamInvitationQuery
} from '../../__generated__/TeamInvitationQuery.graphql'
import {CREATE_ACCOUNT_SLUG, SIGNIN_SLUG} from '../../utils/constants'
import {rootRoute} from './rootRoute'

const AuthenticationRoute = lazyRouteComponent(
  () => import(/* webpackChunkName: 'AuthenticationPage' */ '../../components/AuthenticationRoute')
)
const VerifyEmail = lazyRouteComponent(
  () => import(/* webpackChunkName: 'VerifyEmail' */ '../../components/VerifyEmail')
)

// Password resets only exist where people sign in with a password
const requireInternalAuth = () => {
  if (!window.__ACTION__.AUTH_INTERNAL_ENABLED) throw notFound()
}

export const signInIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: AuthenticationRoute
})
export const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: SIGNIN_SLUG,
  component: AuthenticationRoute
})
export const createAccountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: CREATE_ACCOUNT_SLUG,
  component: AuthenticationRoute
})
export const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'forgot-password',
  beforeLoad: requireInternalAuth,
  component: AuthenticationRoute
})
export const forgotPasswordSubmittedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'forgot-password/submitted',
  beforeLoad: requireInternalAuth,
  component: AuthenticationRoute
})
export const authProviderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'auth/$provider',
  component: lazyRouteComponent(
    () => import(/* webpackChunkName: 'AuthProvider' */ '../../components/AuthProvider')
  )
})
export const samlRedirectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'saml-redirect',
  component: lazyRouteComponent(
    () => import(/* webpackChunkName: 'SAMLRedirect' */ '../../components/SAMLRedirect')
  )
})
export const teamHealthDemoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'team-health-demo',
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'TeamHealthDemoPage' */ '../../components/TeamHealthDemo/TeamHealthDemoPage'
      )
  )
})
export const teamHealthDemoIndexRoute = createRoute({
  getParentRoute: () => teamHealthDemoRoute,
  path: '/'
})
export const teamHealthDemoStepRoute = createRoute({
  getParentRoute: () => teamHealthDemoRoute,
  path: '$'
})
export const verifyEmailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'verify-email/$verificationToken',
  component: VerifyEmail
})
export const verifyEmailInvitationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'verify-email/$verificationToken/$invitationToken',
  component: VerifyEmail
})
export const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'reset-password/$token',
  component: lazyRouteComponent(
    () =>
      import(
        /* webpackChunkName: 'SetNewPassword' */ '../../components/ResetPasswordPage/SetNewPassword'
      )
  )
})
export const oauthAuthorizeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'oauth/authorize',
  component: lazyRouteComponent(
    () => import(/* webpackChunkName: 'OAuthAuthorizePage' */ '../../components/OAuthAuthorizePage')
  )
})
export const teamInvitationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'team-invitation/$token',
  loader: async ({context: {queryRefs}, params: {token}}) => ({
    queryRef: await queryRefs.load<TeamInvitationQuery>(teamInvitationQuery, {token})
  }),
  component: lazyRouteComponent(
    () =>
      import(/* webpackChunkName: 'TeamInvitationRoute' */ '../../components/TeamInvitationRoute')
  )
})
export const invitationLinkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'invitation-link/$token',
  loader: async ({context: {queryRefs}, params: {token}}) => ({
    queryRef: await queryRefs.load<InvitationLinkQuery>(invitationLinkQuery, {token})
  }),
  component: lazyRouteComponent(
    () =>
      import(/* webpackChunkName: 'InvitationLinkRoute' */ '../../components/InvitationLinkRoute')
  )
})
