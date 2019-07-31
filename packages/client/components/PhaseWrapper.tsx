import styled from '@emotion/styled'
import {ReactNode} from 'react'
import ErrorBoundary from './ErrorBoundary'
import React from 'react'

const PhaseWrapperStyles = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
})

interface Props {
  children: ReactNode
}

const PhaseWrapper = (props: Props) => {
  const {children} = props
  return (
    <ErrorBoundary>
      <PhaseWrapperStyles>
        {children}
      </PhaseWrapperStyles>
    </ErrorBoundary>
  )
}
export default PhaseWrapper
