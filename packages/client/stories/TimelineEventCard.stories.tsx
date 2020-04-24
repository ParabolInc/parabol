// import {storiesOf} from '@storybook/react'
// import React from 'react'
// import {TimelineFeedItems} from '../components/MyDashboardTimeline'
// import TimelineEventCompletedRetroMeeting from '../components/TimelineEventCompletedRetroMeeting'
// import TimelineEventJoinedParabol from '../components/TimelineEventJoinedParabol'
// import TimelineEventTeamCreated from '../components/TimelineEventTeamCreated'
// import StoryProvider from './components/StoryProvider'

// const baseEvent = {
//   id: 'foo1',
//   createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toString()
// }
// const teamFrag = {id: 'team1', name: "Matt's Team", isArchived: false}
// const meetingFrag = {
//   id: 'meeting1',
//   createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1.2).toString(),
//   endedAt: new Date().toString(),
//   taskCount: 5,
//   meetingNumber: 2
// }
// storiesOf('Timeline Event Card', module)
//   .add('joined parabol', () => (
//     <StoryProvider>
//       <TimelineFeedItems>
//         <TimelineEventJoinedParabol timelineEvent={baseEvent as any} />
//       </TimelineFeedItems>
//     </StoryProvider>
//   ))
//   .add('team created', () => (
//     <StoryProvider>
//       <TimelineFeedItems>
//         <TimelineEventTeamCreated
//           timelineEvent={{...baseEvent, team: teamFrag, teamId: 'team1'} as any}
//         />
//       </TimelineFeedItems>
//     </StoryProvider>
//   ))
//   .add('completed retro meeting', () => (
//     <StoryProvider>
//       <TimelineFeedItems>
//         <TimelineEventCompletedRetroMeeting
//           timelineEvent={
//             {...baseEvent, team: teamFrag, meeting: meetingFrag, teamId: 'team1'} as any
//           }
//         />
//       </TimelineFeedItems>
//     </StoryProvider>
//   ))
