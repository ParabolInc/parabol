import React from 'react';
import styled from 'react-emotion';
import ui from 'universal/styles/ui';

const ModalBoundary = styled('div')({
  background: ui.palette.white,
  borderRadius: ui.modalBorderRadius,
  display: 'flex',
  height: 280,
  width: 600
});

const CenteredModalBoundary = styled(ModalBoundary)({
  alignItems: 'center',
  flexDirection: 'column',
  justifyContent: 'center'
});

const ModalHeading = styled('h2')({
  fontSize: '1.5rem',
  fontWeight: 600,
  lineHeight: '1.5',
  margin: 0
});

const ModalCopy = styled('p')({
  fontSize: '1rem',
  lineHeight: '2rem',
  margin: 0
});

const UpgradeModalConfirmation = (
  <CenteredModalBoundary>
    <ModalHeading>{'Upgrade Successful!'}</ModalHeading>
    <ModalCopy>{'Your organization is now on the '}<b>{'Pro'}</b>{' tier.'}</ModalCopy>
  </CenteredModalBoundary>
);

const UpgradeModal = () => {
  return UpgradeModalConfirmation;
  // return (
  //   <ModalBoundary>{'Upgrade Modal'}</ModalBoundary>
  // );
};

export default UpgradeModal;
