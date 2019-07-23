import React from 'react'
import ui from 'universal/styles/ui'
import {menuShadow} from 'universal/styles/elevation'
import AnimatedFade from 'universal/components/AnimatedFade'
import styled from '@emotion/styled'
import Modal from 'universal/components/Modal'
import withCoordsV2 from 'universal/decorators/withCoordsV2'

const MenuBlock = styled('div')(({maxWidth}) => ({
  maxWidth,
  padding: '.25rem 0',
  position: 'absolute',
  zIndex: 400
}))

const MenuContents = styled('div')(({maxHeight}) => ({
  backgroundColor: '#fff',
  borderRadius: ui.menuBorderRadius,
  boxShadow: menuShadow,
  maxHeight,
  outline: 0,
  overflowY: 'auto',
  paddingBottom: ui.menuGutterVertical,
  paddingTop: ui.menuGutterVertical,
  textAlign: 'left',
  width: '100%'
}))

const LoadableDraftJSModal = (props) => {
  const {
    closePortal,
    coords,
    isClosing,
    setModalRef,
    LoadableComponent,
    queryVars,
    terminatePortal
  } = props
  return (
    <Modal onClose={closePortal} isOpen>
      <AnimatedFade appear duration={100} slide={32} in={!isClosing} onExited={terminatePortal}>
        <MenuBlock style={coords} innerRef={setModalRef}>
          <MenuContents>
            <LoadableComponent closePortal={closePortal} {...queryVars} />
          </MenuContents>
        </MenuBlock>
      </AnimatedFade>
    </Modal>
  )
}

export default withCoordsV2(LoadableDraftJSModal)
