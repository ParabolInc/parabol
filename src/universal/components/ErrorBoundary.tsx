import * as Sentry from '@sentry/browser'
import React, {Component, ErrorInfo, ReactNode} from 'react'
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent'

interface Props {
  fallback: (error: Error) => ReactNode
  children: ReactNode
}

interface State {
  error?: Error
  errorInfo?: ErrorInfo
}

class ErrorBoundary extends Component<Props, State> {
  state = {
    error: undefined,
    errorInfo: undefined
  }

  componentDidCatch (error: Error, errorInfo: ErrorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error,
      errorInfo
    })
    Sentry.withScope((scope) => {
      Object.keys(errorInfo).forEach((key) => {
        scope.setExtra(key, errorInfo[key])
      })
      Sentry.captureException(error)
    })
  }

  render () {
    const {error} = this.state
    if (error) {
      const {fallback} = this.props
      return fallback ? fallback(error) : <ErrorComponent error={error} />
    }
    // Normally, just render children
    return this.props.children
  }
}

export default ErrorBoundary
