import React from 'react'
import styled from 'react-emotion'

const ErrorBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  textAlign: 'center',
  width: '100%',
  height: '100%'
})

interface Props {
  // can make nonnull when RelayTransitionRoot explicitly defines an error on the ErrorComponent
  error?: Error
}

const ErrorComponent = (props: Props) => {
  const {error} = props
  console.error(error)
  return (
    <ErrorBlock>
      {'An error has occurred! We’ve alerted the developers. Try refreshing the page'}
    </ErrorBlock>
  )
}

export default ErrorComponent
