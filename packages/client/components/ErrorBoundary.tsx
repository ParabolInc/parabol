import {Component, type ErrorInfo, type ReactNode} from 'react'
import type Atmosphere from '~/Atmosphere'
import useAtmosphere from '~/hooks/useAtmosphere'
import {isIgnoredError, isNotSignedInError} from '../utils/errorFilters'
import ErrorComponent from './ErrorComponent/ErrorComponent'

interface Props {
  fallback?: (error: Error, eventId: string) => ReactNode
  children: ReactNode
}

interface State {
  error?: Error
  errorInfo?: ErrorInfo
  eventId?: string
  isIgnoredError: boolean
}

class ErrorBoundary extends Component<Props & {atmosphere: Atmosphere}, State> {
  state: State = {
    error: undefined,
    errorInfo: undefined,
    eventId: undefined,
    isIgnoredError: false
  }

  componentDidUpdate() {
    const {error, isIgnoredError} = this.state
    if (!error || isIgnoredError) return
    const {atmosphere} = this.props
    // the analytics libraries stay out of the entry bundle. AnalyticsPage has already loaded them by now
    import('~/utils/SendClientSideEvent')
      .then(({default: SendClientSideEvent}) => SendClientSideEvent(atmosphere, 'Fatal Error'))
      .catch(() => {})
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const {atmosphere} = this.props
    if (isNotSignedInError(error)) {
      atmosphere.invalidateSession('Not signed in')
    }
    const {viewerId} = atmosphere
    const store = atmosphere.getStore()
    const email = (store?.getSource?.().get?.(viewerId) as any)?.email ?? ''
    const ignoredError = isIgnoredError(error)
    const eventId = crypto.randomUUID()
    this.setState({
      error,
      errorInfo,
      eventId,
      isIgnoredError: ignoredError
    })

    const {componentStack} = errorInfo
    import('@datadog/browser-logs')
      .then(({datadogLogs}) => {
        datadogLogs.logger.error(error.message, {viewerId, email, componentStack, eventId}, error)
      })
      .catch(() => {})
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

const ErrorBoundaryFn = (props: Props) => {
  const atmosphere = useAtmosphere()
  return <ErrorBoundary {...props} atmosphere={atmosphere} />
}

export default ErrorBoundaryFn
