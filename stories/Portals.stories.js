/**
 * Stories for Portal components.
 *
 * @flow
 */

import React from 'react'
import {storiesOf} from '@storybook/react'
import HelpMenu from 'universal/components/HelpMenu'
import RetroBackground from './components/RetroBackground'
import StoryContainer from './components/StoryContainer'

storiesOf('Loadable Help Dialog', module).add('toggle the help dialog', () => (
  <RetroBackground>
    <StoryContainer
      description={`This demonstrates a help dialog (available for all teammates)
          and an optional tip (for the facilitator in the control bar)`}
      render={() => (
        <div style={{padding: '50vh 0 0'}}>
          <div
            style={{display: 'flex', justifyContent: 'flex-end', padding: '0 1.25rem 1.25rem 0'}}
          >
            <HelpMenu heading='Reflect' content='Add anonymous reflections for each prompt' />
          </div>
        </div>
      )}
    />
  </RetroBackground>
))
