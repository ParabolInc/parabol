import React from 'react';
import ui from 'universal/styles/ui';
import AnimatedFade from 'universal/components/AnimatedFade';
import styled from 'react-emotion';
import type {WithCoordsProps} from 'universal/decorators/withCoordsV2';
import Modal from 'universal/components/Modal';
import withCoordsV2 from 'universal/decorators/withCoordsV2';

const MenuBlock = styled('div')(({maxWidth}) => ({
  maxWidth,
  padding: '.25rem 0',
  position: 'absolute',
  zIndex: ui.ziMenu
}));

const MenuContents = styled('div')(({maxHeight}) => ({
  backgroundColor: ui.menuBackgroundColor,
  borderRadius: ui.menuBorderRadius,
  boxShadow: ui.menuBoxShadow,
  maxHeight,
  outline: 0,
  overflowY: 'auto',
  paddingBottom: ui.menuGutterVertical,
  paddingTop: ui.menuGutterVertical,
  textAlign: 'left',
  width: '100%'
}));

type Props = {
  LoadableComponent: React.Component,
  queryVars?: Object,
  ...WithCoordsProps
};

const LoadableDraftJSModal = (props: Props) => {
  const {closePortal, coords, isClosing, setModalRef, LoadableComponent, queryVars, terminatePortal} = props;
  return (
    <Modal onClose={closePortal} isOpen>
      <AnimatedFade appear duration={100} slide={32} in={!isClosing} onExited={terminatePortal}>
        <MenuBlock style={coords} innerRef={setModalRef}>
          <MenuContents>
            <LoadableComponent {...queryVars} />
          </MenuContents>
        </MenuBlock>
      </AnimatedFade>
    </Modal>
  );
};

export default withCoordsV2(LoadableDraftJSModal);
