/*
 * Let’s take a look at misc. UI components
 *
 * @flow
 */
import React from 'react'
import {storiesOf} from '@storybook/react'
import RetroBackground from './components/RetroBackground'
import StoryContainer from './components/StoryContainer'

import FlatButton from 'universal/components/FlatButton'
import LinkButton from 'universal/components/LinkButton'
import OutlinedButton from 'universal/components/OutlinedButton'
import PrimaryButton from 'universal/components/PrimaryButton'
import RaisedButton from 'universal/components/RaisedButton'
import IconLabel from 'universal/components/IconLabel'

import LoadingView from 'universal/components/LoadingView/LoadingView'

const handleDemoClick = () => console.log('demo click handler!')

storiesOf('Misc. UI Components', module)
  .add('Button variants', () => (
    <RetroBackground>
      <StoryContainer
        render={() => (
          <div style={{backgroundColor: 'white', width: '600px', padding: '20px'}}>
            <FlatButton onClick={handleDemoClick}>{'Flat Button'}</FlatButton>
            <br />
            <LinkButton onClick={handleDemoClick}>{'Link Button'}</LinkButton>
            <br />
            <OutlinedButton onClick={handleDemoClick}>{'Outlined Button'}</OutlinedButton>
            <br />
            <PrimaryButton onClick={handleDemoClick}>{'Primary Button'}</PrimaryButton>
            <br />
            <RaisedButton onClick={handleDemoClick}>{'Raised Button'}</RaisedButton>
            <br />
            <RaisedButton onClick={handleDemoClick}>
              <IconLabel icon='check_circle' label='Button with IconLabel' />
            </RaisedButton>
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
