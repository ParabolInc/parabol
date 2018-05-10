import React from 'react';
import StyledFontAwesome from 'universal/components/StyledFontAwesome';
import styled from 'react-emotion';
import ui from 'universal/styles/ui';

const modalCopyBase = {
  fontSize: '.9375rem',
  lineHeight: '2rem',
  margin: 0
};

const StyledIcon = styled(StyledFontAwesome)({
  color: ui.linkColor,
  fontSize: ui.iconSize,
  marginRight: '.5rem',
  opacity: 0.5,
  width: '1.125rem'
});

const BulletIcon = styled(StyledIcon)({
  color: ui.palette.green,
  opacity: 1
});

const ModalCopy = styled('p')({...modalCopyBase});

const benefits = [
  'Run Unlimited Retrospective Meetings',
  'Customize Social Check-In Rounds',
  'Access an Unlimited Archive'
];

const UpgradeBenefits = () => {
  return (
    benefits.map((benefit, idx) => {
      return (
        <ModalCopy key={`modalBulletCopy-${idx + 1}`}>
          <BulletIcon name="check-circle" />
          {benefit}
        </ModalCopy>
      );
    })
  );
};

export default UpgradeBenefits;
