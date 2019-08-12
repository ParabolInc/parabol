import styled from '@emotion/styled'
import {forwardRef, ReactNode} from 'react'
import ErrorBoundary from './ErrorBoundary'
import React from 'react'

const PhaseWrapperStyles = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  alignItems: 'center',
  justifyContent: 'center'
})

interface Props {
  children: ReactNode
}

const PhaseWrapper = forwardRef((props: Props, ref: any) => {
  const {children} = props
  return (
    <ErrorBoundary>
      <PhaseWrapperStyles ref={ref}>
        {children}
      </PhaseWrapperStyles>
    </ErrorBoundary>
  )
})
export default PhaseWrapper
