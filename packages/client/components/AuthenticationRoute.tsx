import {useLocation, useMatch} from '@tanstack/react-router'
import {useEffect} from 'react'
import useAtmosphere from '../hooks/useAtmosphere'
import {unauthenticatedSnackbar} from '../hooks/useAuthRoute'
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
  const atmosphere = useAtmosphere()
  const routeId = useMatch({strict: false, select: (match) => match.routeId})
  // a signed-out visit to a private page lands here, and says why
  const isSignInRequired = useLocation({select: (location) => !!location.state.isSignInRequired})
  useEffect(() => {
    if (!isSignInRequired) return
    setTimeout(() => atmosphere.eventEmitter.emit('addSnackbar', unauthenticatedSnackbar))
  }, [atmosphere, isSignInRequired])
  return <AuthenticationPage page={PAGE_BY_ROUTE_ID[routeId ?? ''] ?? 'signin'} />
}

export default AuthenticationRoute
