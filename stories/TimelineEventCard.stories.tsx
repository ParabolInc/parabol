import {storiesOf} from '@storybook/react'
import React from 'react'
import {TimelineFeedItems} from '../src/universal/components/MyDashboardTimeline'
import TimelineEventJoinedParabol from '../src/universal/components/TimelineEventJoinedParabol'
import StoryProvider from './components/StoryProvider'

storiesOf('Timeline Event Card', module).add('joined parabol', () => (
  <StoryProvider>
    <TimelineFeedItems>
      <TimelineEventJoinedParabol
        timelineEvent={{id: 'foo1', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10)}}
      />
    </TimelineFeedItems>
  </StoryProvider>
))
