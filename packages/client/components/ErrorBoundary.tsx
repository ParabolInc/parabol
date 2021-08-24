import * as Sentry from '@sentry/browser'
import LogRocket from 'logrocket'
import React, {Component, ErrorInfo, ReactNode} from 'react'
import withAtmosphere, {WithAtmosphereProps} from '~/decorators/withAtmosphere/withAtmosphere'
import {LocalStorageKey} from '~/types/constEnums'
import ErrorComponent from './ErrorComponent/ErrorComponent'
import safeInitLogRocket from '../utils/safeInitLogRocket'

interface Props extends WithAtmosphereProps {
  fallback?: (error: Error, eventId: string) => ReactNode
  children: ReactNode
}

interface State {
  error?: Error
  errorInfo?: ErrorInfo
  eventId?: string
}

class ErrorBoundary extends Component<Props, State> {
  state: State = {
    error: undefined,
    errorInfo: undefined,
    eventId: undefined
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const {atmosphere} = this.props
    const {viewerId} = atmosphere
    const store = atmosphere.getStore()
    const email = (store as any)?._recordSource?._records?.[viewerId]?.email ?? ''
    if (viewerId) {
      Sentry.configureScope((scope) => {
        scope.setUser({email, id: viewerId})
      })
    }
    const logRocketId = window.__ACTION__.logRocket
    if (logRocketId) {
      safeInitLogRocket(viewerId, email)
      window.localStorage.setItem(LocalStorageKey.ERROR_PRONE_AT, new Date().toJSON())
      LogRocket.captureException(error)
      LogRocket.track('Fatal error')
    }
    // Catch errors in any components below and re-render with error message
    Sentry.withScope((scope) => {
      scope.setExtras(errorInfo)
      scope.setLevel(Sentry.Severity.Fatal)
      const eventId = Sentry.captureException(error)
      this.setState({
        error,
        errorInfo,
        eventId
      })
    })
  }

  render() {
    const {error, eventId} = this.state
    if (error && eventId) {
      const {fallback} = this.props
      return fallback ? (
        fallback(error, eventId)
      ) : (
        <ErrorComponent error={error} eventId={eventId} />
      )
    }
    // Normally, just render children
    return this.props.children
  }
}

export default withAtmosphere(ErrorBoundary)
