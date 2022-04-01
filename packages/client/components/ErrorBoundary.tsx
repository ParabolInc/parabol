import * as Sentry from '@sentry/browser'
import React, {Component, ErrorInfo, ReactNode} from 'react'
import withAtmosphere, {WithAtmosphereProps} from '~/decorators/withAtmosphere/withAtmosphere'
import SendClientSegmentEventMutation from '~/mutations/SendClientSegmentEventMutation'
import ErrorComponent from './ErrorComponent/ErrorComponent'
import {isOldBrowserError} from '../utils/isOldBrowserError'

interface Props extends WithAtmosphereProps {
  fallback?: (error: Error, eventId: string) => ReactNode
  children: ReactNode
}

interface State {
  error?: Error
  errorInfo?: ErrorInfo
  eventId?: string
  isOldBrowserErr: boolean
}

class ErrorBoundary extends Component<Props, State> {
  state: State = {
    error: undefined,
    errorInfo: undefined,
    eventId: undefined,
    isOldBrowserErr: false
  }

  componentDidUpdate() {
    const {error, isOldBrowserErr} = this.state
    if (!error || isOldBrowserErr) return
    const {atmosphere} = this.props
    const {viewerId} = atmosphere
    SendClientSegmentEventMutation(atmosphere, 'Fatal Error', {viewerId})
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const {atmosphere} = this.props
    const {viewerId} = atmosphere
    const store = atmosphere.getStore()
    const email = (store as any)?._recordSource?._records?.[viewerId]?.email ?? ''
    const isOldBrowserErr = isOldBrowserError(error.message)
    if (viewerId) {
      Sentry.configureScope((scope) => {
        scope.setUser({email, id: viewerId})
      })
    }
    // Catch errors in any components below and re-render with error message
    Sentry.withScope((scope) => {
      scope.setExtras(errorInfo as any)
      scope.setLevel(Sentry.Severity.Fatal)
      const eventId = Sentry.captureException(error)
      this.setState({
        error,
        errorInfo,
        eventId,
        isOldBrowserErr
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
