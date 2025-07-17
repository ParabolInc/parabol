import {datadogRum} from '@datadog/browser-rum'
import {Component, ErrorInfo, ReactNode} from 'react'
import Atmosphere from '~/Atmosphere'
import useAtmosphere from '~/hooks/useAtmosphere'
import SendClientSideEvent from '~/utils/SendClientSideEvent'
import {isOldBrowserError} from '../utils/isOldBrowserError'
import ErrorComponent from './ErrorComponent/ErrorComponent'

interface Props {
  fallback?: (error: Error, eventId: string) => ReactNode
  children: ReactNode
}

interface State {
  error?: Error
  errorInfo?: ErrorInfo
  eventId?: string
  isOldBrowserErr: boolean
}

class ErrorBoundary extends Component<Props & {atmosphere: Atmosphere}, State> {
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
    SendClientSideEvent(atmosphere, 'Fatal Error')
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const {atmosphere} = this.props
    const {viewerId} = atmosphere
    const store = atmosphere.getStore()
    const email = (store?.getSource?.().get?.(viewerId) as any)?.email ?? ''
    const isOldBrowserErr = isOldBrowserError(error.message)
    const eventId = crypto.randomUUID()
    this.setState({
      error,
      errorInfo,
      eventId,
      isOldBrowserErr
    })

    const renderingError = new Error(error.message)
    renderingError.name = 'ReactRenderingError'
    renderingError.stack = errorInfo.componentStack
    renderingError.cause = error
    datadogRum.addError(renderingError, {viewerId, email})
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
