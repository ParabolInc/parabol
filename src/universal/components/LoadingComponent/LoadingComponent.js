import React from 'react'
import Spinner from 'universal/modules/spinner/components/Spinner/Spinner'
import styled from 'react-emotion'

const LoadingWrapper = styled('div')(({height = '100%', width = '100%'}) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height,
  width
}))

type Props = {
  height?: number | string,
  width?: number | string,
  spinnerSize?: number,
  timeOut?: boolean
}

const LoadingComponent = (props: Props) => {
  const {height, width, spinnerSize = 40, timedOut} = props
  return (
    <LoadingWrapper height={height} width={width}>
      <Spinner fillColor={timedOut ? 'warm' : 'cool'} width={spinnerSize} />
    </LoadingWrapper>
  )
}

export default LoadingComponent
