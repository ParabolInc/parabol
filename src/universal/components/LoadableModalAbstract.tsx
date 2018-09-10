import React, {Component, ComponentType} from 'react'
import styled from 'react-emotion'
import AnimatedFade from 'universal/components/AnimatedFade'
import Modal from 'universal/components/Modal'
import ui from 'universal/styles/ui'
import {WithAnimatedPortalProps} from '../decorators/withAnimatedPortal'

const ModalBlock = styled('div')({
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  zIndex: 400,
  position: 'fixed',
  alignItems: 'center',
  justifyContent: 'center'
})

const ModalContents = styled('div')({
  display: 'flex',
  flex: '0 1 auto',
  flexDirection: 'column',
  maxHeight: '90vh',
  position: 'relative'
})

const Backdrop = styled('div')({
  background: ui.modalBackdropBackgroundColor,
  width: '100%',
  height: '100%',
  position: 'fixed'
})

export interface LoadableModalAbstractProps extends WithAnimatedPortalProps {
  LoadableComponent: ComponentType<any>
  queryVars?: any
}

interface State {
  isOpen: boolean
  isClosing: boolean
}

class LoadableModalAbstract extends Component<LoadableModalAbstractProps, State> {
  render () {
    const {
      isClosing,
      isOpen,
      closePortal,
      LoadableComponent,
      queryVars,
      terminatePortal
    } = this.props
    return (
      <Modal clickToClose escToClose onClose={closePortal} isOpen={isOpen}>
        <ModalBlock>
          <AnimatedFade appear duration={200} slide={0} in={!isClosing} onExited={terminatePortal}>
            <Backdrop onClick={closePortal} />
          </AnimatedFade>
          <AnimatedFade appear duration={200} slide={32} in={!isClosing} onExited={terminatePortal}>
            <ModalContents>
              <LoadableComponent {...queryVars} closePortal={closePortal} />
            </ModalContents>
          </AnimatedFade>
        </ModalBlock>
      </Modal>
    )
  }
}

export default LoadableModalAbstract
