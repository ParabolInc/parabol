import React from 'react'
import styled from 'react-emotion'
import Spinner from 'universal/modules/spinner/components/Spinner/Spinner'
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
  height?: number | string
  width?: number | string
  spinnerSize?: number
}

const LoadingComponent = (props: Props) => {
  const {height, width, spinnerSize = LoaderSize.MAIN} = props
  const minDelay = useTimeout(Times.HUMAN_ADDICTION_THRESH)
  const timedOut = useTimeout(Times.MAX_WAIT_TIME)
  if (!minDelay) return null
  return (
    <LoadingWrapper height={height} width={width}>
      <Spinner fillColor={timedOut ? 'warm' : 'cool'} width={spinnerSize} />
    </LoadingWrapper>
  )
}

export default LoadingComponent
