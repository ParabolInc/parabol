/**
 * Stories for Portal components.
 *
 * @flow
 */

import React from 'react'
import {storiesOf} from '@storybook/react'
import RetroBackground from './components/RetroBackground'
import StoryContainer from './components/StoryContainer'
import styled from 'react-emotion'
import elevation from 'universal/styles/elevation'
import ui from 'universal/styles/ui'

const demoCardSize = '8rem'

const Grid = styled('div')({
  display: 'grid',
  gridGap: '2.5rem',
  gridTemplateColumns: `repeat(auto-fill, ${demoCardSize})`
})

const Elevation = styled('div')(({depth, index}) => ({
  backgroundColor: 'white',
  boxShadow: `${depth}`,
  borderRadius: '.125rem',
  color: ui.palette.midGray,
  height: demoCardSize,
  padding: '1rem',
  width: demoCardSize,
  '::after': {
    content: `"${index}dp"`
  }
}))

const RenderBlock = () => (
  <Grid>
    {elevation.map((depth, index) => {
      return <Elevation depth={depth} index={index} key={`${index}dp`} />
    })}
  </Grid>
)

storiesOf('Elevation', module).add('elevations on parade', () => (
  <RetroBackground>
    <StoryContainer
      description={`This shows example elevations, a link to Material defaults as a reference, and a working list of how we use elevation in our app`}
      render={RenderBlock}
    />
  </RetroBackground>
))
