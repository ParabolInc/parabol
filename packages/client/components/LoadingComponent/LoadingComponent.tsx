import {forwardRef, useEffect} from 'react'
import type {LoadingDelayRef} from '../../hooks/useLoadingDelay'
import useTimeout from '../../hooks/useTimeout'
import Spinner from '../../modules/spinner/components/Spinner/Spinner'
import {LoaderSize, Times} from '../../types/constEnums'

interface Props {
  delay?: number
  height?: number | string
  width?: number | string
  loadingDelayRef?: LoadingDelayRef
  showAfter?: number
  spinnerSize?: number
}

// the ref isn't currenty used, but the Menu component likes to pass along a ref to figure out if the child is an item
const LoadingComponent = forwardRef((props: Props, ref: any) => {
  const {
    delay,
    height,
    loadingDelayRef,
    width,
    spinnerSize = LoaderSize.MAIN,
    showAfter = Times.HUMAN_ADDICTION_THRESH
  } = props
  const minDelay = useTimeout(showAfter)
  const timedOut = useTimeout(Times.MAX_WAIT_TIME)
  useEffect(() => {
    if (loadingDelayRef) {
      loadingDelayRef.current.start = Date.now()
    }
    const loadingDelay = loadingDelayRef && loadingDelayRef.current
    return () => {
      if (loadingDelay) {
        loadingDelay.stop = Date.now()
        loadingDelay.forceUpdate()
      }
    }
  }, [loadingDelayRef])
  if (showAfter && !minDelay) return null
  return (
    <div
      ref={ref}
      className='flex h-[-webkit-fill-available] w-[-webkit-fill-available] flex-col items-center justify-center'
      style={{height, width}}
    >
      <Spinner
        delay={delay}
        fill={timedOut ? 'var(--color-tomato-500)' : 'var(--color-aqua-400)'}
        width={spinnerSize}
      />
    </div>
  )
})

export default LoadingComponent
