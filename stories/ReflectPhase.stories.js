/**
 * Stories for the ReflectionCard component.
 *
 * @flow
 */
// $FlowFixMe
import React from 'react'
import {storiesOf} from '@storybook/react'
import RetroBackground from './components/RetroBackground'
import StoryContainer from './components/StoryContainer'
import ReflectionStackPlaceholder from 'universal/components/RetroReflectPhase/ReflectionStackPlaceholder'

storiesOf('Reflect Phase', module).add('placeholder', () => (
  <RetroBackground>
    <StoryContainer render={() => <ReflectionStackPlaceholder idx={0} />} />
  </RetroBackground>
))
