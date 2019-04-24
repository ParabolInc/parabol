/* Depcreated. See useMenu */
import React, {Suspense} from 'react'
import ui from 'universal/styles/ui'
import AnimatedFade from 'universal/components/AnimatedFade'
import styled from 'react-emotion'
import type {WithCoordsProps} from 'universal/decorators/withCoordsV2'
import withCoordsV2 from 'universal/decorators/withCoordsV2'
import Modal from 'universal/components/Modal'
import type {ToggledPortalProps} from 'universal/decorators/withToggledPortal'
import withToggledPortal from 'universal/decorators/withToggledPortal'
import ErrorBoundary from 'universal/components/ErrorBoundary'
import MenuContents from 'universal/components/MenuContents'

const MenuBlock = styled('div')({
  padding: '.25rem 0',
  position: 'absolute',
  zIndex: ui.ziMenu
})

type Props = {
  LoadableComponent: React.Component,
  queryVars?: Object,
  ...ToggledPortalProps,
  ...WithCoordsProps
}

const LoadableMenu = (props: Props) => {
  const {
    closePortal,
    coords,
    isClosing,
    isOpen,
    minWidth,
    onClose,
    onOpen,
    maxHeight,
    maxWidth,
    setModalRef,
    LoadableComponent,
    queryVars,
    terminatePortal
  } = props
  const handleClose = (e) => {
    closePortal(e)
    onClose && onClose(e)
  }
  return (
    <ErrorBoundary>
      <Modal clickToClose escToClose onClose={handleClose} isOpen={isOpen} onOpen={onOpen}>
        <AnimatedFade appear duration={100} slide={32} in={!isClosing} onExited={terminatePortal}>
          <MenuBlock style={{...coords, maxWidth, minWidth}} innerRef={setModalRef}>
            <MenuContents style={{maxHeight}}>
              <Suspense fallback={''}>
                <LoadableComponent {...queryVars} closePortal={handleClose} />
              </Suspense>
            </MenuContents>
          </MenuBlock>
        </AnimatedFade>
      </Modal>
    </ErrorBoundary>
  )
}

export default withCoordsV2(withToggledPortal(LoadableMenu))
