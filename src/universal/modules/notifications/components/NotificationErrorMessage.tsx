import styled from 'react-emotion'
import {PALETTE} from 'universal/styles/paletteV2'
import React from 'react'

const StyledError = styled('div')({
  color: PALETTE.ERROR.MAIN,
  fontWeight: 600,
  fontSize: 14,
  textAlign: 'center'
  // padding: '0 8rem .75rem 3.5rem'
})

interface Props {
  error: {message: string} | undefined | null
}
const NotificationErrorMessage = (props: Props) => {
  const {error} = props
  if (!error) return null
  return <StyledError>{error.message}</StyledError>
}

export default NotificationErrorMessage
