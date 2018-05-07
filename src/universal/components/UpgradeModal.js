import React from 'react';
import styled from 'react-emotion';

const ModalBoundary = styled('div')({
  width: 200,
  height: 200,
  background: 'white'
});

const UpgradeModal = () => {
  return (
    <ModalBoundary>{'Upgrade Modal'}</ModalBoundary>
  );
};

export default UpgradeModal;
