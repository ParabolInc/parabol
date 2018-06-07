/*
 * Let’s take a look at misc. UI components
 *
 * @flow
 */
import React from 'react'
import {storiesOf} from '@storybook/react'
import RetroBackground from './components/RetroBackground'
import StoryContainer from './components/StoryContainer'
import Button from 'universal/components/Button'
import LoadingView from 'universal/components/LoadingView/LoadingView'

storiesOf('Misc. UI Components', module)
  .add('Button variants', () => (
    <RetroBackground>
      <StoryContainer
        render={() => (
          <div style={{backgroundColor: 'white', width: '600px', padding: '20px'}}>
            <Button
              colorPalette='gray'
              buttonSize='small'
              buttonStyle='solid'
              label='Take Action Now'
            />
            <Button
              colorPalette='dark'
              buttonSize='medium'
              buttonStyle='solid'
              label='Take Action Now'
            />
            <Button buttonSize='large' buttonStyle='primary' label='Take Action Now' />
          </div>
        )}
      />
    </RetroBackground>
  ))
  .add('Loading view', () => (
    <RetroBackground>
      <StoryContainer render={() => <LoadingView />} />
    </RetroBackground>
  ))
