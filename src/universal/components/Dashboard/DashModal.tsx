import React, {ReactNode} from 'react'
import styled from 'react-emotion'
import {modalShadow} from 'universal/styles/elevation'
import ui from 'universal/styles/ui'
import {DECELERATE} from '../../styles/animation'

const animateIn = {
  '0%': {
    opacity: '0',
    transform: 'translate3d(0, -50px, 0)'
  },
  '100%': {
    opacity: '1',
    transform: 'translate3d(0, 0, 0)'
  }
}

const Backdrop = styled('div')({
  alignItems: 'center',
  background: ui.modalBackdropBackgroundColor,
  bottom: 0,
  display: 'flex !important',
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'center',
  left: 0,
  position: 'absolute',
  right: 0,
  textAlign: 'center',
  top: 0,
  zIndex: 200
})

const Modal = styled('div')({
  animationIterationCount: 1,
  animation: `${animateIn} 200ms ${DECELERATE}`,
  background: '#fff',
  borderRadius: ui.modalBorderRadius,
  boxShadow: modalShadow,
  overflow: 'hidden',
  padding: '1.25rem',
  width: '30rem'
})

interface Props {
  children: ReactNode
  onBackdropClick?: () => void
}

const DashModal = (props: Props) => {
  const {children, onBackdropClick} = props
  const onClick = (e) => {
    if (onBackdropClick && e.target === e.currentTarget) {
      onBackdropClick()
    }
  }
  return (
    <Backdrop onClick={onBackdropClick ? onClick : undefined}>
      <Modal>{children}</Modal>
    </Backdrop>
  )
}

export default DashModal
