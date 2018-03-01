// @flow
import React from 'react';
import ui from 'universal/styles/ui';
import styled from 'react-emotion';
import AnimatedFade from 'universal/components/AnimatedFade';
import withLoadablePortal from 'universal/decorators/withLoadablePortal';
import type {LoadablePortalProps} from 'universal/decorators/withLoadablePortal';

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
});

const ModalContents = styled('div')({
  display: 'flex',
  flex: '0 1 auto',
  flexDirection: 'column',
  maxHeight: '90vh',
  overflowY: 'auto',
  position: 'relative'
});

const Backdrop = styled('div')({
  background: ui.modalBackdropBackgroundColor,
  width: '100%',
  height: '100%',
  position: 'fixed'
});

type Props = {
  LoadableComponent: typeof React.Component,
  queryVars?: Object,
  ...LoadablePortalProps
};

const LoadableModal = (props: Props) => {
  const {isClosing, closePortal, LoadableComponent, queryVars, terminatePortal} = props;
  return (
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
  );
};

export default withLoadablePortal()(LoadableModal);
