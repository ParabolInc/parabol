import {useMatch} from '@tanstack/react-router'
import {CREATE_ACCOUNT_SLUG, SIGNIN_SLUG} from '../utils/constants'
import AuthenticationPage from './AuthenticationPage'
import type {AuthPageSlug} from './GenericAuthentication'

const PAGE_BY_ROUTE_ID: Record<string, AuthPageSlug> = {
  [`/${SIGNIN_SLUG}`]: 'signin',
  [`/${CREATE_ACCOUNT_SLUG}`]: 'create-account',
  '/forgot-password': 'forgot-password',
  '/forgot-password/submitted': 'forgot-password/submitted'
}

const AuthenticationRoute = () => {
  const routeId = useMatch({strict: false, select: (match) => match.routeId})
  return <AuthenticationPage page={PAGE_BY_ROUTE_ID[routeId ?? ''] ?? 'signin'} />
}

export default AuthenticationRoute
