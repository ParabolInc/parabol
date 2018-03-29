// Working on new meeting components
// @flow
// $FlowFixMe
import React from 'react';
// import {action} from '@storybook/addon-actions';
import {storiesOf} from '@storybook/react';

import {LabelHeading} from 'universal/components';

import MeetingControlBar from 'universal/modules/meeting/components/MeetingControlBar/MeetingControlBar';
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading';
import MeetingCopy from 'universal/modules/meeting/components/MeetingCopy/MeetingCopy';
import SimpleMeetingPrompt from 'universal/modules/meeting/components/MeetingPrompt/SimpleMeetingPrompt';

import RetroBackground from './components/RetroBackground';
import StoryContainer from './components/StoryContainer';

storiesOf('Meeting Components', module)
  .add('Social Check-In Heading', () => (
    <RetroBackground>
      <StoryContainer
        render={() => (
          <div>
            <LabelHeading>{'Social Check-In'}</LabelHeading>
            <MeetingPhaseHeading>{'Terry’s Check-In'}</MeetingPhaseHeading>
            <MeetingCopy margin="0">{'Terry, share your response to today’s prompt.'}</MeetingCopy>
          </div>
        )}
      />
    </RetroBackground>
  ))
  .add('Solo Updates Heading', () => (
    <RetroBackground>
      <StoryContainer
        render={() => (
          <div>
            <LabelHeading>{'Solo Updates'}</LabelHeading>
            <MeetingPhaseHeading>{'Terry’s Updates'}</MeetingPhaseHeading>
            <MeetingCopy margin="0">{'Terry, what’s changed with your tasks?'}</MeetingCopy>
          </div>
        )}
      />
    </RetroBackground>
  ))
  .add('Action Agenda Heading', () => (
    <RetroBackground>
      <StoryContainer
        render={() => (
          <div>
            <LabelHeading>{'Team Agenda'}</LabelHeading>
            <MeetingPhaseHeading>{'“metrics”'}</MeetingPhaseHeading>
            <MeetingCopy margin="0">{'Terry, what do you need?'}</MeetingCopy>
          </div>
        )}
      />
    </RetroBackground>
  ))
  .add('Meeting Control Bar Example', () => (
    <RetroBackground>
      <StoryContainer
        render={() => (
          <div style={{display: 'flex', flex: 1, flexDirection: 'column', flexShrink: 0}}>
            <div style={{display: 'flex', flex: 1, flexShrink: 0}}>{'Meeting Content'}</div>
            <MeetingControlBar>{'Psst. Facilitator, you can control the meeting here!'}</MeetingControlBar>
          </div>
        )}
      />
    </RetroBackground>
  ))
  .add('Simple Meeting Prompt', () => (
    <RetroBackground>
      <StoryContainer
        render={() => (
          <SimpleMeetingPrompt><b>{'Bojan'}</b>{', what has your attention today?'}</SimpleMeetingPrompt>
        )}
      />
    </RetroBackground>
  ));
