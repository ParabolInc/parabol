import React, {ReactNode} from 'react'
import LoadingComponent from '../../components/LoadingComponent/LoadingComponent'

interface LoaderOptions {
  Loader?: ReactNode
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
