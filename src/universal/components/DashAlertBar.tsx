import React, {ReactNode} from 'react'
import styled from 'react-emotion'
import useScrollY from 'universal/hooks/useScrollY'
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

const Alert = styled('div')(
  {
    backgroundColor: PALETTE.BACKGROUND.RED,
    color: '#fff',
    display: 'flex',
    fontSize: 18,
    justifyContent: 'center',
    lineHeight: '22px',
    padding: '10px 16px',
    transition: 'opacity 200ms',
    textAlign: 'center',
    userSelect: 'none',
    // for maintaining spaces with the over limit message
    whiteSpace: 'pre',
    width: '100%'
  },
  ({scrollY}: {scrollY: number}) =>
    scrollY > ALERT_HEIGHT && {
      alignSelf: 'center',
      borderRadius: '42px',
      opacity: 0.5,
      width: 'auto',
      zIndex: 1,
      ':hover': {
        opacity: 1
      }
    }
)

interface Props {
  children: ReactNode
}

const DashAlertBar = (props: Props) => {
  const {children} = props
  const scrollY = useScrollY()
  return (
    <Alert scrollY={scrollY} style={{transform: `translateY(${getTranslate(scrollY)}px)`}}>
      {children}
    </Alert>
  )
}

export default DashAlertBar
