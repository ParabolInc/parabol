import styled from '@emotion/styled'
import {PALETTE} from '../../../styles/paletteV2'
import React from 'react'

const StyledError = styled('div')({
  color: PALETTE.ERROR_MAIN,
  fontWeight: 600,
  fontSize: 14,
  textAlign: 'center'
  // padding: '0 8rem .75rem 3.5rem'
})

interface Props {
  className?: string
  error: {message: string} | undefined | null
}
const NotificationErrorMessage = (props: Props) => {
  const {className, error} = props
  if (!error) return null
  return <StyledError className={className}>{error.message}</StyledError>
}

export default NotificationErrorMessage
