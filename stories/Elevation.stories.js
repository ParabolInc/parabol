/**
 * Stories for Portal components.
 *
 * @flow
 */

import React from 'react'
import {storiesOf} from '@storybook/react'
import RetroBackground from './components/RetroBackground'
import StoryContainer from './components/StoryContainer'

storiesOf('Loadable Help Dialog', module).add('toggle the help dialog', () => (
  <RetroBackground>
    <StoryContainer
      description={`This demonstrates a help dialog (available for all teammates)
          and an optional tip (for the facilitator in the control bar)`}
      render={() => <div>Elevation</div>}
    />
  </RetroBackground>
))
