/**
 * Display a pop-up to show help content per meeting phase.
 *
 * @flow
 */

import React from 'react';
import styled from 'react-emotion';
import {Button} from 'universal/components';
import LoadableMeetingHelpDialogMenu from 'universal/modules/meeting/components/MeetingHelpDialog/LoadableMeetingHelpDialogMenu';
import LoadableMenu from 'universal/components/LoadableMenu';

type Props = {
  phase: string
};

const ButtonBlock = styled('div')({
  width: '2rem'
});

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
};

const targetAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
};

const MeetingHelpDialog = ({phase}: Props) => {
  const iconButtonToggle = (
    <ButtonBlock>
      <Button
        buttonSize="small"
        buttonStyle="solid"
        colorPalette="white"
        icon="question"
        isBlock
      />
    </ButtonBlock>
  );

  return (
    <LoadableMenu
      LoadableComponent={LoadableMeetingHelpDialogMenu}
      maxWidth={280}
      maxHeight={320}
      originAnchor={originAnchor}
      queryVars={{phase}}
      targetAnchor={targetAnchor}
      toggle={iconButtonToggle}
    />
  );
};

export default MeetingHelpDialog;
