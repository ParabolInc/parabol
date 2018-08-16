import React from 'react'
import Spinner from 'universal/modules/spinner/components/Spinner/Spinner'
import ui from 'universal/styles/ui'
import styled from 'react-emotion'

const LoadingWrapper = styled('div')(({height = '20rem', width = ui.settingsPanelMaxWidth}) => ({
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
    <LoadingWrapper heigth={height} width={width}>
      <Spinner fillColor={timedOut ? 'warm' : 'cool'} width={spinnerSize} />
    </LoadingWrapper>
  )
}

export default LoadingComponent
