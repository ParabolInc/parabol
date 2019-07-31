import React, {ReactNode} from 'react'
import styled from '@emotion/styled'
import useScrollY from '../hooks/useScrollY'
import {PALETTE} from '../styles/paletteV2'

// todo get reference to get dynamic height
const ALERT_HEIGHT = 42
const ALERT_TOP_PADDING = 16
const getTranslate = (y: number) =>
  y < ALERT_HEIGHT
    ? 0
    : y < ALERT_HEIGHT * 2
    ? ((y - ALERT_HEIGHT) * (ALERT_HEIGHT * 2 + ALERT_TOP_PADDING)) / ALERT_HEIGHT
    : y + ALERT_TOP_PADDING

const Alert = styled('div')<{scrollY: number}>(
  {
    backgroundColor: PALETTE.BACKGROUND_RED,
    color: '#fff',
    fontSize: 14,
    lineHeight: '22px',
    transition: 'opacity 200ms',
    width: '100%'
  },
  ({scrollY}) =>
    scrollY > ALERT_HEIGHT && {
      alignSelf: 'center',
      borderRadius: '4em',
      width: 'auto',
      zIndex: 1
    }
)

const Inner = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  maxWidth: '100vw',
  overflow: 'hidden', // repro: mobile, new team form, 3+ meetings in progress
  padding: '10px 16px',
  textAlign: 'center',
  userSelect: 'none',
  // for maintaining spaces with the over limit message
  whiteSpace: 'pre'
})

interface Props {
  children: ReactNode
}

const DashAlertBar = (props: Props) => {
  const {children} = props
  const scrollY = useScrollY()
  return (
    <Alert scrollY={scrollY} style={{transform: `translateY(${getTranslate(scrollY)}px)`}}>
      <Inner>{children}</Inner>
    </Alert>
  )
}

export default DashAlertBar
