import React from 'react';
import ui from 'universal/styles/ui';
import AnimatedFade from 'universal/components/AnimatedFade';
import styled from 'react-emotion';

import type {LoadablePortalProps} from 'universal/decorators/withLoadablePortal';
import withLoadablePortal from 'universal/decorators/withLoadablePortal';
import type {WithCoordsProps} from 'universal/decorators/withCoordsV2';

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
  ...LoadablePortalProps,
  ...WithCoordsProps
};

const LoadableMenu = (props: Props) => {
  const {closePortal, coords, isClosing, setModalRef, LoadableComponent, queryVars, terminatePortal} = props;
  return (
    <AnimatedFade appear duration={100} slide={32} in={!isClosing} onExited={terminatePortal}>
      <MenuBlock style={coords} innerRef={setModalRef}>
        <MenuContents>
          <LoadableComponent {...queryVars} closePortal={closePortal} />
        </MenuContents>
      </MenuBlock>
    </AnimatedFade>
  );
};

export default withLoadablePortal({withCoords: true})(LoadableMenu);
