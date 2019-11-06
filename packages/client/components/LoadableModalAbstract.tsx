import React, {Component, ComponentType, Suspense} from 'react'
import styled from '@emotion/styled'
import AnimatedFade from './AnimatedFade'
import Modal from './Modal'
import {PALETTE} from '../styles/paletteV2'
import {modalShadow} from '../styles/elevation'
import {ZIndex} from '../types/constEnums'
import {WithAnimatedPortalProps} from '../decorators/withAnimatedPortal'

const ModalBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  height: '100%',
  justifyContent: 'center',
  left: 0,
  position: 'fixed',
  top: 0,
  width: '100%',
  zIndex: ZIndex.DIALOG
})

const ModalContents = styled('div')({
  boxShadow: modalShadow,
  display: 'flex',
  flex: '0 1 auto',
  flexDirection: 'column',
  maxHeight: '90vh',
  position: 'relative'
})

const Backdrop = styled('div')<{background: string}>(({background}) => ({
  background,
  height: '100%',
  position: 'fixed',
  width: '100%'
}))

export interface LoadableModalAbstractProps extends WithAnimatedPortalProps {
  background?: string
  LoadableComponent: ComponentType<any>
  queryVars?: any
}

interface State {
  isOpen: boolean
  isClosing: boolean
}

class LoadableModalAbstract extends Component<LoadableModalAbstractProps, State> {
  render() {
    const {
      background,
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
            <Backdrop
              onClick={closePortal}
              background={background || PALETTE.BACKGROUND_BACKDROP}
            />
          </AnimatedFade>
          <AnimatedFade appear duration={200} slide={32} in={!isClosing} onExited={terminatePortal}>
            <ModalContents>
              <Suspense fallback={''}>
                <LoadableComponent {...queryVars} closePortal={closePortal} />
              </Suspense>
            </ModalContents>
          </AnimatedFade>
        </ModalBlock>
      </Modal>
    )
  }
}

export default LoadableModalAbstract
