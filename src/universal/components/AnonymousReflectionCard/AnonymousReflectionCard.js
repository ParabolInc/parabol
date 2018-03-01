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
  isEditing?: boolean
};

const BlurredDiv = styled('div')({
  filter: 'blur(4px)',
  userSelect: 'none'
});

const ReflectionContents = styled('div')({
  padding: '0.8rem'
});

const createGibberish = (): string => {
  const numWords = 5 + Math.round(Math.random() * 10);
  const gibberish = [];
  for (let i = 0; i < numWords; i++) {
    const numLetters = 1 + Math.round(Math.random() * 10);
    const curWord = [];
    for (let j = 0; j < numLetters; j++) {
      const letter = Math.round(Math.random() * 25);
      curWord.push(String.fromCharCode(97 + letter));
    }
    gibberish.push(curWord.join(''));
  }
  return gibberish.join(' ');
};

const Gibberish = () => (
  <BlurredDiv>{createGibberish()}</BlurredDiv>
);

const AnonymousReflectionCard = ({isEditing}: Props) => {
  return (
    <ReflectionCardWrapper>
      <ReflectionContents>
        {isEditing
          ? 'Somebody is typing...'
          : <Gibberish />
        }
      </ReflectionContents>
    </ReflectionCardWrapper>
  );
};

export default AnonymousReflectionCard;
