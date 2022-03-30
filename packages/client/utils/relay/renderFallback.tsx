import React, {ComponentType, ReactNode} from 'react'
import ErrorComponent from '../../components/ErrorComponent/ErrorComponent'
import LoadingComponent from '../../components/LoadingComponent/LoadingComponent'
import * as Sentry from '@sentry/browser'

interface LoaderOptions {
  Loader?: ReactNode
  props?: {[key: string]: any}
  size?: number
  loadingDelay?: number
  menuLoadingWidth?: number
}

export const renderLoader = (options: LoaderOptions = {}) => {
  if (options.Loader) {
    return options.Loader
  }

  const {menuLoadingWidth, loadingDelay, size} = options
  return (
    <LoadingComponent
      delay={loadingDelay}
      spinnerSize={size || 24}
      height={menuLoadingWidth ? 24 : undefined}
      width={menuLoadingWidth}
      showAfter={menuLoadingWidth ? 0 : undefined}
    />
  )
}

type ErrorOptions = {Error?: ComponentType<{error: any}>}

export const renderError = (error: Error, options: ErrorOptions = {}) => {
  const Error = options.Error || ErrorComponent
  const eventId = Sentry.captureException(error)
  return <Error error={error} eventId={eventId} />
}
