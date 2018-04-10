// @flow
import React from 'react';
import styled from 'react-emotion';
import FontAwesome from 'react-fontawesome';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import {phaseLabelLookup} from 'universal/utils/meetings/lookups';
import phaseHelpLookup from 'universal/utils/meetings/helpLookups';

type Props = {
  closePortal: () => void,
  phase: string
};

const DialogContent = styled('div')({
  fontSize: appTheme.typography.s2,
  lineHeight: '1.5',
  position: 'relative',
  padding: '.75rem 1.25rem',
  width: '15rem',
  '& h3': {
    fontSize: '1em',
    fontWeight: 600,
    margin: '0 0 1em'
  },
  '& p': {
    margin: '0 0 1em'
  },
  '& a': {
    textDecoration: 'underline'
  }
});

const DialogClose = styled(FontAwesome)({
  color: ui.palette.warm,
  cursor: 'pointer',
  height: ui.iconSize,
  fontSize: ui.iconSize,
  position: 'absolute',
  right: '.25rem',
  top: '-.25rem',
  width: ui.iconSize,
  '&:hover': {
    opacity: '.5'
  }
});

const MeetingHelpDialogMenu = (props: Props) => {
  const {closePortal, phase} = props;

  return (
    <DialogContent>
      <DialogClose name="times-circle" onClick={closePortal} title="Close help menu" />
      <h3>{phaseLabelLookup[phase]}</h3>
      {phaseHelpLookup[phase].helpDialog}
    </DialogContent>
  );
};

export default MeetingHelpDialogMenu;
