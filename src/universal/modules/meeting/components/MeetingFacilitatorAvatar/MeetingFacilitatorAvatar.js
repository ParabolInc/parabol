import React from 'react';
import styled from 'react-emotion';
import {Avatar} from 'universal/components';

const AvatarBlock = styled('div')({
  marginRight: '1rem'
});

const MeetingFacilitatorAvatar = (props) => (
  <AvatarBlock>
    <Avatar {...props} />
  </AvatarBlock>
);

export default MeetingFacilitatorAvatar;
