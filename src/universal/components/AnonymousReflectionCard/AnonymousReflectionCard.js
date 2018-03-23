/**
 * Shows an "anonymous" reflection card; e.g. a card created by another teammate
 * which has not yet become visible.
 *
 * @flow
 */

import React from 'react';
import styled from 'react-emotion';

import ReflectionCardWrapper from 'universal/components/ReflectionCardWrapper/ReflectionCardWrapper';

type Props = {
  content?: string,
  isEditing?: boolean
};

const BlurredDiv = styled('div')({
  filter: 'blur(4px)',
  userSelect: 'none'
});

const ReflectionContents = styled('div')({
  padding: '0.8rem'
});

const AnonymousReflectionCard = ({content, isEditing}: Props) => {
  return (
    <ReflectionCardWrapper>
      <ReflectionContents>
        {isEditing || !content || !content.length
          ? 'Somebody is typing...'
          : content && <BlurredDiv>{content}</BlurredDiv>
        }
      </ReflectionContents>
    </ReflectionCardWrapper>
  );
};

export default AnonymousReflectionCard;
