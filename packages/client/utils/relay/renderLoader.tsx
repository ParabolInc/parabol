import LoadingComponent from '../../components/LoadingComponent/LoadingComponent'

interface LoaderOptions {
  size?: number
  loadingDelay?: number
  menuLoadingWidth?: number
}

export const Loader = (props: LoaderOptions = {}) => {
  const {menuLoadingWidth, loadingDelay, size} = props

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
