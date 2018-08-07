/**
 * Stories for the AddReflectionButton component.
 *
 * @flow
 */

import React from 'react'
import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react'

import AddReflectionButton from 'universal/components/AddReflectionButton/AddReflectionButton'

import RetroBackground from './components/RetroBackground'
import StoryContainer from './components/StoryContainer'

storiesOf('Add Reflection Button', module).add('adds a reflection', () => (
  <RetroBackground>
    <StoryContainer
      render={() => (
        <AddReflectionButton
          retroPhaseItem={{retroPhaseItemId: '1'}}
          meeting={{meetingId: '2'}}
          handleClick={action('handle-click-add-reflection')}
        />
      )}
    />
  </RetroBackground>
))
