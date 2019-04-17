import React, {useEffect} from 'react'
import styled from 'react-emotion'
import {LoadingDelayRef} from 'universal/hooks/useLoadingDelay'
import Spinner from 'universal/modules/spinner/components/Spinner/Spinner'
import {PALETTE} from 'universal/styles/paletteV2'
import {LoaderSize, Times} from 'universal/types/constEnums'
import useTimeout from '../../hooks/useTimeout'

interface WrapperProps {
  height?: string | number
  width?: string | number
}

const LoadingWrapper = styled('div')(
  ({height = 'fill-available', width = 'fill-available'}: WrapperProps) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height,
    width
  })
)

type Props = {
  delay?: number
  height?: number | string
  width?: number | string
  loadingDelayRef?: LoadingDelayRef
  showAfter?: number
  spinnerSize?: number
}

const LoadingComponent = (props: Props) => {
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
    return () => {
      if (loadingDelayRef) {
        loadingDelayRef.current.stop = Date.now()
        loadingDelayRef.current.forceUpdate()
      }
    }
  }, [])
  if (showAfter && !minDelay) return null
  return (
    <LoadingWrapper height={height} width={width}>
      <Spinner
        delay={delay}
        fill={timedOut ? PALETTE.ERROR.MAIN : PALETTE.BACKGROUND.TEAL}
        width={spinnerSize}
      />
    </LoadingWrapper>
  )
}

export default LoadingComponent
