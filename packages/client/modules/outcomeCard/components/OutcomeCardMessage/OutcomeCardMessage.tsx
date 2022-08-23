import styled from '@emotion/styled'
import {Close as CloseIcon} from '@mui/icons-material'
import React from 'react'
import {PALETTE} from '../../../../styles/paletteV3'

const Message = styled('div')({
  padding: '0 16px 16px'
})

const textShadow = '0 1px rgba(0, 0, 0, .15)'
const Inner = styled('div')<{canClose: boolean}>(({canClose}) => ({
  backgroundColor: PALETTE.TOMATO_500,
  borderRadius: 2,
  color: '#FFFFFF',
  display: 'block',
  fontWeight: 600,
  fontSize: 13,
  lineHeight: '18px',
  padding: 15,
  position: 'relative',
  textShadow,
  paddingRight: canClose ? 22 : undefined
}))

const MessageClose = styled('div')({
  cursor: 'pointer',
  fontSize: 0,
  outline: 'none',
  padding: 4,
  position: 'absolute',
  right: 0,
  textShadow,
  top: 0,
  ':hover,:focus': {
    opacity: 0.5
  }
})

const MessageCloseIcon = styled('div')({
  color: '#FFFFFF',
  '& svg': {
    fontSize: 18
  },
  height: 18,
  width: 18
})

interface Props {
  onClose: (...args: any[]) => void
  message: string
}

const OutcomeCardMessage = (props: Props) => {
  const {onClose, message} = props
  return (
    <Message>
      <Inner canClose={!!onClose}>
        {message}
        {onClose && (
          <MessageClose onClick={onClose} tabIndex={0}>
            <MessageCloseIcon>
              <CloseIcon />
            </MessageCloseIcon>
          </MessageClose>
        )}
      </Inner>
    </Message>
  )
}

export default OutcomeCardMessage
