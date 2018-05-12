/*
 * Stories for the Retro Summary
 *
 * @flow
 */
import React from 'react';
import {storiesOf} from '@storybook/react';
import RetroBackground from './components/RetroBackground';
import StoryContainer from './components/StoryContainer';
import RetroDiscussionTopics from 'universal/modules/email/components/RetroDiscussionTopics/RetroDiscussionTopics';

const exampleTopic = {
  theme: 'Support',
  voteCount: 7,
  reflections: [
    {
      content: 'This is my pithy reflection'
    },
    {
      content: 'This is my pithy reflection'
    },
    {
      content: 'This is my pithy reflection'
    },
    {
      content: 'This is my pithy reflection'
    },
    {
      content: 'This is my pithy reflection'
    }
  ]
};

const exampleTopics = [exampleTopic, exampleTopic, exampleTopic, exampleTopic, exampleTopic];

storiesOf('Retro Summary', module).add('Voted topics', () => (
  <RetroBackground>
    <StoryContainer
      render={() => (
        <div style={{backgroundColor: 'white', width: '600px', padding: '20px'}}>
          <RetroDiscussionTopics imageSource="local" topics={exampleTopics} />
        </div>
      )}
    />
  </RetroBackground>
));
