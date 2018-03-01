/**
 * Stories for the RetroCard component.
 *
 * @flow
 */

import React from 'react';
import styled from 'react-emotion';
import FontAwesome from 'react-fontawesome';
import {action} from '@storybook/addon-actions';
import {storiesOf} from '@storybook/react';

import PlainButton from 'universal/components/PlainButton/PlainButton';
import appTheme from 'universal/styles/theme/appTheme';

import StoryContainer from './components/StoryContainer';

type Props = {
  contents: string,
  handleDelete: () => any
};

const RetroBackground = styled('div')({
  backgroundColor: '#F1F0FA',
  padding: '1rem',
  height: '100%',
  width: '100%'
});

const RetroCardWrapper = styled('div')({
  backgroundColor: '#FFF',
  borderRadius: 3,
  boxShadow: '0 0 1px 1px rgba(0, 0, 0, .1)',
  color: appTheme.palette.dark,
  minHeight: '1rem',
  padding: '0.8rem',
  position: 'relative',
  width: '20rem'
});

const RetroCardText = styled('div')({
  maxHeight: '10rem',
  overflow: 'auto'
});

const DeleteButton = styled(PlainButton)({
  backgroundColor: 'rgba(0, 0, 0, 0)',
  color: 'red',
  position: 'absolute',
  top: '-0.5rem',
  right: '-0.5rem',
  zIndex: 1
});

const RetroCard = ({contents, handleDelete}: Props) => {
  const placeholder = 'My reflection thought...';
  return (
    <RetroCardWrapper>
      <DeleteButton aria-label="Delete this reflection" onClick={handleDelete}>
        <FontAwesome name="times-circle" />
      </DeleteButton>
      <RetroCardText>{contents || placeholder}</RetroCardText>
    </RetroCardWrapper>
  );
};

// STORIES

storiesOf('RetroCard', module)
  .add('with no contents', () => (
    <StoryContainer
      render={() => (
        <RetroBackground>
          <RetroCard
            contents=""
            handleDelete={action('clicked-delete')}
          />
        </RetroBackground>
      )}
    />
  ))
  .add('with one line', () => (
    <StoryContainer
      render={() => (
        <RetroBackground>
          <RetroCard
            contents="One line of text."
            handleDelete={action('clicked-delete')}
          />
        </RetroBackground>
      )}
    />
  ))
  .add('with many lines', () => (
    <StoryContainer
      render={() => (
        <RetroBackground>
          <RetroCard
            contents={
              'This is a long observation. ' +
              'I have a lot of feelings and want my team to know. ' +
              "There's much to say, and I hope people have the patience to read this because it's, like, super important. " +
              'At some point, this will get really long, and it should probably overflow by scrolling. ' +
              "I hope folks don't get mad at me for writing so much. " +
              'Seriously. When will I stop??'
            }
            handleDelete={action('clicked-delete')}
          />
        </RetroBackground>
      )}
    />
  ));
