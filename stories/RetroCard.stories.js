/**
 * Stories for the RetroCard component.
 *
 * @flow
 */
import type {Node} from 'react';

import React, {Component} from 'react';
import styled from 'react-emotion';
import {storiesOf} from '@storybook/react';

import injectGlobals from 'universal/styles/hepha';
import appTheme from 'universal/styles/theme/appTheme';
import globalStyles from 'universal/styles/theme/globalStyles';

// GLOBAL STYLES

type GlobalStylesProps = {
  render: () => Node
};

const FullPageWrapper = styled('div')({
  height: '100vh',
  padding: '1rem',
  width: '100vw'
});

/**
 * Provides global style primitives so that comonents rendered in the storybook
 * look like those rendered in the app.
 */
class StoryContainer extends Component<GlobalStylesProps> {
  componentWillMount() {
    injectGlobals(globalStyles);
  }

  render() {
    return <FullPageWrapper>{this.props.render()}</FullPageWrapper>;
  }
}

// RETRO CARD

type Props = {
  contents: string
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
  maxHeight: '10rem',
  minHeight: '1rem',
  overflow: 'auto',
  padding: '0.8rem',
  width: '15rem'
});

const RetroCard = ({contents}: Props) => {
  const placeholder = 'My reflection thought...';
  return <RetroCardWrapper>{contents || placeholder}</RetroCardWrapper>;
};

// STORIES

storiesOf('RetroCard', module)
  .add('with no contents', () => (
    <StoryContainer
      render={() => (
        <RetroBackground>
          <RetroCard contents="" />
        </RetroBackground>
      )}
    />
  ))
  .add('with one line', () => (
    <StoryContainer
      render={() => (
        <RetroBackground>
          <RetroCard contents="One line of text." />
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
              "I hope folks don't get mad at me for writing so much."
            }
          />
        </RetroBackground>
      )}
    />
  ));
