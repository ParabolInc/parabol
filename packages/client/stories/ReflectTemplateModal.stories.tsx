// import {withKnobs} from '@storybook/addon-knobs'
// import {storiesOf} from '@storybook/react'
// import React from 'react'
// import ReflectTemplateModal from '../modules/meeting/components/ReflectTemplateModal'
// import StoryProvider from './components/StoryProvider'

// const retroMeetingSettings = {
//   reflectTemplates: [
//     {
//       id: '1',
//       name: 'Standard',
//       prompts: [
//         {
//           id: '1-0',
//           question: 'good',
//           sortOrder: 0
//         },
//         {
//           id: '1-1',
//           question: 'bad',
//           sortOrder: 1
//         }
//       ]
//     },
//     {
//       id: '2',
//       name: 'Different',
//       prompts: [
//         {
//           id: '2-0',
//           question: 'wonky',
//           sortOrder: 0
//         },
//         {
//           id: '2-1',
//           question: 'weird',
//           sortOrder: 1
//         }
//       ]
//     }
//   ],
//   selectedTemplateId: '1'
// }

// storiesOf('ReflectTemplateModal', module)
//   .addDecorator(withKnobs)
//   .add('base', () => (
//     <StoryProvider>
//       <ReflectTemplateModal retroMeetingSettings={retroMeetingSettings as any} />
//     </StoryProvider>
//   ))
