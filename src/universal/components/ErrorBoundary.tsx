import React, {Component, ErrorInfo, ReactNode} from 'react'
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent'
import * as Sentry from '@sentry/browser'

interface Props {
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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
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

  render() {
    const {error} = this.state
    if (error) {
      return <ErrorComponent error={error!} />
    }
    // Normally, just render children
    return this.props.children
  }
}

export default ErrorBoundary
