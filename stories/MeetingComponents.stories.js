// Working on new meeting components
// @flow
// $FlowFixMe
import React from 'react';
// import {action} from '@storybook/addon-actions';
import {storiesOf} from '@storybook/react';
import styled from 'react-emotion';

import {LabelHeading} from 'universal/components';
import MeetingControlBar from 'universal/modules/meeting/components/MeetingControlBar/MeetingControlBar';
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading';
import MeetingCopy from 'universal/modules/meeting/components/MeetingCopy/MeetingCopy';
import SimpleMeetingPrompt from 'universal/modules/meeting/components/MeetingPrompt/SimpleMeetingPrompt';
import MeetingFacilitatorAvatar from 'universal/modules/meeting/components/MeetingFacilitatorAvatar/MeetingFacilitatorAvatar';
import picture from 'universal/styles/theme/images/avatars/marimar-suarez-penalva.jpg';

import RetroBackground from './components/RetroBackground';
import StoryContainer from './components/StoryContainer';

const FlexBlock = styled('div')(({direction, margin}) => ({
  alignItems: 'flex-start',
  display: 'flex',
  flexDirection: direction || 'row',
  justifyContent: 'flex-start',
  margin: margin || 0
}));

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
  .add('Retro Theme Heading', () => (
    <RetroBackground>
      <StoryContainer
        render={() => (
          <div>
            <LabelHeading>{'Theme'}</LabelHeading>
            <MeetingPhaseHeading>{'Group by Theme'}</MeetingPhaseHeading>
            <MeetingCopy margin="0">{'Drag cards to group by common themes'}</MeetingCopy>
          </div>
        )}
      />
    </RetroBackground>
  ))
  .add('Retro Vote Heading', () => (
    <RetroBackground>
      <StoryContainer
        render={() => (
          <div>
            <LabelHeading>{'Vote'}</LabelHeading>
            <MeetingPhaseHeading>{'Vote'}</MeetingPhaseHeading>
            <MeetingCopy margin="0">{'Vote on the themes you want to discuss'}</MeetingCopy>
          </div>
        )}
      />
    </RetroBackground>
  ))
  .add('Retro Discuss Heading', () => (
    <RetroBackground>
      <StoryContainer
        render={() => (
          <div>
            <LabelHeading>{'Discuss'}</LabelHeading>
            <MeetingPhaseHeading>{'What might we do differently next time?'}</MeetingPhaseHeading>
            <MeetingCopy margin="0">{'Create takeaway task cards to capture next steps'}</MeetingCopy>
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
          <FlexBlock direction="column" margin="auto">
            <FlexBlock margin="0 0 3rem">
              <MeetingFacilitatorAvatar size="small" picture={picture} />
              <MeetingCopy margin="auto auto auto 0">{'Marimar is today’s facilitator.'}</MeetingCopy>
            </FlexBlock>
            <FlexBlock>
              <MeetingFacilitatorAvatar size="small" picture={picture} />
              <SimpleMeetingPrompt><b>{'Bojan'}</b>{', what has your attention today?'}</SimpleMeetingPrompt>
            </FlexBlock>
          </FlexBlock>
        )}
      />
    </RetroBackground>
  ));
